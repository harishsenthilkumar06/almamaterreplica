document.getElementById('login-page-btn').addEventListener('click', function() {
    const url = 'https://auth.delta.nitt.edu/authorize';
    const params = {
        client_id: 'WcL5heC7zICR7vTW',
        response_type: 'authorization_code',
        redirect_uri: 'http://www.almamater.linkpc.net/callback',
        scope: 'profile email user', // Use space instead of '+'; fetch encodes it
        grant_type: 'authorization_code',
        nonce: '1234'
    };

    // Convert params to query string
    const queryString = new URLSearchParams(params).toString();

    // Final URL with query parameters
    const fullUrl = `${url}?${queryString}`;

    // Perform the GET request
    window.top.location.href = fullUrl;
});