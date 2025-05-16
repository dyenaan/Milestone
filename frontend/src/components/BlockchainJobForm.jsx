import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { blockchainService } from '../services/blockchain';

const BlockchainJobForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [txHash, setTxHash] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        freelancerAddress: '',
        milestones: [
            { description: 'Milestone 1', amount: '' }
        ]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMilestoneChange = (index, field, value) => {
        const updatedMilestones = [...formData.milestones];
        updatedMilestones[index] = {
            ...updatedMilestones[index],
            [field]: value
        };

        setFormData(prev => ({
            ...prev,
            milestones: updatedMilestones
        }));
    };

    const addMilestone = () => {
        setFormData(prev => ({
            ...prev,
            milestones: [
                ...prev.milestones,
                { description: `Milestone ${prev.milestones.length + 1}`, amount: '' }
            ]
        }));
    };

    const removeMilestone = (index) => {
        if (formData.milestones.length <= 1) return;

        const updatedMilestones = formData.milestones.filter((_, i) => i !== index);

        setFormData(prev => ({
            ...prev,
            milestones: updatedMilestones
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.walletAddress) {
            setError('Please connect your wallet first');
            return;
        }

        if (!formData.freelancerAddress) {
            setError('Freelancer address is required');
            return;
        }

        // Validate all milestone amounts
        const invalidMilestone = formData.milestones.find(m => !m.amount || isNaN(parseFloat(m.amount)) || parseFloat(m.amount) <= 0);

        if (invalidMilestone) {
            setError('All milestone amounts must be valid numbers greater than zero');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Extract milestone amounts for blockchain call
            const milestoneAmounts = formData.milestones.map(m => parseFloat(m.amount) * 100000000); // Convert to APT units (10^8)

            // Create job on blockchain
            const result = await blockchainService.createJob(
                user.walletAddress,
                {
                    freelancerAddress: formData.freelancerAddress,
                    milestoneAmounts
                }
            );

            setSuccess(true);
            setTxHash(result.transaction_hash);

            // Reset form
            setFormData({
                title: '',
                description: '',
                freelancerAddress: '',
                milestones: [
                    { description: 'Milestone 1', amount: '' }
                ]
            });

            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err) {
            console.error('Error creating job:', err);
            setError(err.message || 'Failed to create job. Please check your wallet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user || !user.walletAddress) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Not Connected</h2>
                    <p className="text-gray-600 mb-4">You need to connect your wallet to create a blockchain job</p>
                    <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center">
                    <div className="bg-green-100 rounded-full p-2 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Created Successfully!</h2>
                    <p className="text-gray-600 mb-4">Your job has been created on the blockchain</p>

                    {txHash && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">Transaction Hash:</p>
                            <p className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                                {txHash}
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-gray-500 mb-4">Redirecting to dashboard...</p>

                    <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a New Blockchain Job</h2>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label htmlFor="freelancerAddress" className="block text-gray-700 font-semibold mb-2">
                        Freelancer Wallet Address *
                    </label>
                    <input
                        type="text"
                        id="freelancerAddress"
                        name="freelancerAddress"
                        value={formData.freelancerAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0x..."
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        The Aptos wallet address of the freelancer who will work on this job
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
                        Job Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Website Development"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
                        Job Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the job requirements, deliverables, and timeline..."
                        required
                    ></textarea>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-700 font-semibold">
                            Milestones *
                        </label>
                        <button
                            type="button"
                            onClick={addMilestone}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            + Add Milestone
                        </button>
                    </div>

                    {formData.milestones.map((milestone, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Milestone {index + 1}</h4>
                                {formData.milestones.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMilestone(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="mb-2">
                                <label htmlFor={`milestone-${index}-description`} className="block text-gray-700 text-sm mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id={`milestone-${index}-description`}
                                    value={milestone.description}
                                    onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor={`milestone-${index}-amount`} className="block text-gray-700 text-sm mb-1">
                                    Amount (APT)
                                </label>
                                <input
                                    type="number"
                                    id={`milestone-${index}-amount`}
                                    value={milestone.amount}
                                    onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.0"
                                    required
                                />
                            </div>
                        </div>
                    ))}

                    <p className="text-xs text-gray-500 mt-1">
                        Break down the job into milestone payments that will be released as work is completed
                    </p>
                </div>

                <div className="flex justify-between items-center mt-8">
                    <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </div>
                        ) : (
                            "Create Job"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlockchainJobForm; 