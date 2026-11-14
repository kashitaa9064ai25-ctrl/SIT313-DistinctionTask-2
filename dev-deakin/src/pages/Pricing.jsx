import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

function Pricing() {
    const { currentUser, userPlan } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');

    const handleUpgradeClick = () => {
        // Only logged-in users can trigger the upgrade flow
        if (!currentUser) {
            alert('Please log in first to upgrade your subscription plan.');
            navigate('/login');
            return;
        }

        // If already on a Paid plan, alert and block modal
        if (userPlan === 'Paid') {
            setAlertMsg('You are already subscribed to the Paid Plan.');
            return;
        }

        // User is logged in and on Free plan -> open modal
        setIsModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        setIsModalOpen(false);
        setAlertMsg('Congratulations! Your account has been upgraded to the Paid Plan.');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Choose Your Plan
                </h2>
                <p className="mt-3 text-lg text-gray-500">
                    Compare features between Free and Paid plans for DEV@Deakin.
                </p>

                {alertMsg && (
                    <div className="my-6 max-w-lg mx-auto bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded text-sm font-medium">
                        {alertMsg}
                    </div>
                )}

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {/* Free Tier Card */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 flex flex-col justify-between">
                        <div>
                            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 uppercase mb-4">
                                Basic
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Free Plan</h3>
                            <p className="text-4xl font-extrabold text-gray-900 mt-4">
                                ₹0 <span className="text-sm font-normal text-gray-500">/month</span>
                            </p>

                            <ul className="mt-6 space-y-3 text-left text-sm text-gray-600">
                                <li className="flex items-center">✔ Browse free user posts and tutorials</li>
                                <li className="flex items-center">✔ Create up to 5 posts per month</li>
                                <li className="flex items-center">✔ Maximum 2MB image upload limit</li>
                                <li className="flex items-center text-gray-400">✖ No premium tutorial access</li>
                                <li className="flex items-center text-gray-400">✖ Standard author profile badge</li>
                            </ul>
                        </div>

                        <div className="mt-8">
                            <button
                                disabled
                                className="w-full bg-gray-200 text-gray-500 font-semibold py-2.5 rounded-lg cursor-not-allowed text-sm"
                            >
                                {userPlan === 'Free' && currentUser ? 'Current Plan' : 'Standard Access'}
                            </button>
                        </div>
                    </div>

                    {/* Paid / Premium Tier Card */}
                    <div className="bg-white rounded-xl shadow-lg border-2 border-amber-400 p-8 flex flex-col justify-between relative">
                        <span className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Recommended
                        </span>

                        <div>
                            <div className="inline-block bg-amber-100 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 uppercase mb-4">
                                Premium
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Paid Plan</h3>
                            <p className="text-4xl font-extrabold text-gray-900 mt-4">
                                ₹499 <span className="text-sm font-normal text-gray-500">/month</span>
                            </p>

                            <ul className="mt-6 space-y-3 text-left text-sm text-gray-700">
                                <li className="flex items-center font-medium">✔ Unlimited article and question posts</li>
                                <li className="flex items-center font-medium">✔ Media uploads allowed up to 25MB</li>
                                <li className="flex items-center font-medium">✔ Full access to exclusive tutorials & articles</li>
                                <li className="flex items-center font-medium">✔ Verified Premium Author badge</li>
                                <li className="flex items-center font-medium">✔ Priority support & analytics dashboard</li>
                            </ul>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleUpgradeClick}
                                disabled={userPlan === 'Paid'}
                                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors shadow ${userPlan === 'Paid'
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                                    }`}
                            >
                                {userPlan === 'Paid' ? 'Active Subscription' : 'Upgrade Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Popup */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}

export default Pricing;