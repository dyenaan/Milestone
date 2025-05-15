const testBackendConnection = async () => {
    try {
        const healthResponse = await fetch('http://localhost:8000/health');
        const healthData = await healthResponse.json();
        console.log('Backend Health:', healthData);

        // Try to get jobs (likely to fail without auth, but should connect)
        try {
            const jobsResponse = await fetch('http://localhost:8000/api/jobs');
            const jobsStatus = jobsResponse.status;
            console.log('Jobs API status code:', jobsStatus);

            // Get the response body as text
            const jobsText = await jobsResponse.text();
            console.log('Jobs API response:', jobsText);
        } catch (error) {
            console.error('Jobs API error:', error.message);
        }
    } catch (error) {
        console.error('Health check error:', error.message);
    }
};

// Run the test
testBackendConnection(); 