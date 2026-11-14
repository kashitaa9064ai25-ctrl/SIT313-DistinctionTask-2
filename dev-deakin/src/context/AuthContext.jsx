import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userPlan, setUserPlan] = useState("Free");
    const [loading, setLoading] = useState(true);

    // Synchronize user session and subscription tier on mount/page reload
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const storedUser = localStorage.getItem("deakin_user");
                const storedToken = localStorage.getItem("deakin_token");
                const storedPlan = localStorage.getItem("deakin_plan") || "Free";

                if (storedUser && storedToken) {
                    const parsedUser = JSON.parse(storedUser);
                    setCurrentUser(parsedUser);
                    setUserPlan(storedPlan);

                    // Fetch the latest plan directly from Firestore if available
                    if (parsedUser.uid) {
                        try {
                            const userDocRef = doc(db, "users", parsedUser.uid);
                            const userSnap = await getDoc(userDocRef);

                            if (userSnap.exists()) {
                                const firestorePlan = userSnap.data().plan || "Free";
                                setUserPlan(firestorePlan);
                                localStorage.setItem("deakin_plan", firestorePlan);
                            }
                        } catch (err) {
                            console.warn("Could not fetch remote Firestore user plan:", err);
                        }
                    }
                }
            } catch (err) {
                console.error("Error restoring user session:", err);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    // Login handler: stores token, user details, and plan in state and localStorage
    const login = async (userData, token, plan = "Free") => {
        localStorage.setItem("deakin_token", token);
        localStorage.setItem("deakin_user", JSON.stringify(userData));
        localStorage.setItem("deakin_plan", plan);

        setCurrentUser(userData);
        setUserPlan(plan);
    };

    // Logout handler: clears session tokens and resets plan
    const logout = () => {
        localStorage.removeItem("deakin_token");
        localStorage.removeItem("deakin_user");
        localStorage.removeItem("deakin_plan");

        setCurrentUser(null);
        setUserPlan("Free");
    };

    // Plan upgrade handler: writes 'Paid' to Firestore and syncs state
    const upgradeToPaid = async () => {
        if (!currentUser || !currentUser.uid) {
            throw new Error("No authenticated user found to upgrade.");
        }

        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                plan: "Paid",
                upgradedAt: new Date().toISOString()
            });

            setUserPlan("Paid");
            localStorage.setItem("deakin_plan", "Paid");
            return true;
        } catch (error) {
            console.error("Error updating subscription plan in Firestore:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                userPlan,
                login,
                logout,
                upgradeToPaid,
                loading,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};