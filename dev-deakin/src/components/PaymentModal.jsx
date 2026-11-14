import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function PaymentModal({ isOpen, onClose, onSuccess }) {
    const { upgradeToPaid } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
    });
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Name validation
        if (!formData.name.trim()) {
            setError('Please enter the cardholder name.');
            return;
        }

        // 2. Card number validation (16 digits)
        const cleanCard = formData.cardNumber.replace(/\s+/g, '');
        if (cleanCard.length !== 16 || !/^\d+$/.test(cleanCard)) {
            setError('Please enter a valid 16-digit card number.');
            return;
        }

        // 3. Expiry date format check (MM/YY with months 01-12)
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
            setError('Expiry must be formatted as MM/YY with a valid month (01-12).');
            return;
        }

        // 4. Past expiration date check against current system date
        const [expMonthStr, expYearStr] = formData.expiry.split('/');
        const expMonth = parseInt(expMonthStr, 10);
        const expYear = parseInt('20' + expYearStr, 10);

        const now = new Date();
        const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
        const currentYear = now.getFullYear();

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            setError('The card expiration date cannot be in the past.');
            return;
        }

        // 5. CVC security code validation (3 digits)
        if (formData.cvc.length !== 3 || !/^\d+$/.test(formData.cvc)) {
            setError('CVC must be a 3-digit security code.');
            return;
        }

        setIsProcessing(true);

        try {
            await upgradeToPaid();
            setIsProcessing(false);
            onSuccess();
        } catch (err) {
            console.error('Payment Modal Upgrade Error:', err);
            setError('Unable to process subscription update. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Upgrade to Paid Plan</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Enter mock payment details to activate your Premium subscription (₹499/mo).
                </p>

                {error && (
                    <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            CARDHOLDER NAME
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. N Kashitaa"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            CARD NUMBER
                        </label>
                        <input
                            type="text"
                            name="cardNumber"
                            placeholder="1234567890123456"
                            maxLength={16}
                            value={formData.cardNumber}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                        />
                    </div>

                    <div className="flex space-x-3">
                        <div className="w-1/2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                EXPIRY (MM/YY)
                            </label>
                            <input
                                type="text"
                                name="expiry"
                                placeholder="12/28"
                                maxLength={5}
                                value={formData.expiry}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                required
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                CVC
                            </label>
                            <input
                                type="password"
                                name="cvc"
                                placeholder="123"
                                maxLength={3}
                                value={formData.cvc}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded text-sm transition-colors disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PaymentModal;