import axios from 'axios';

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        console.log('Login Success:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        console.log('Set-Cookie:', response.headers['set-cookie']);
    } catch (error: any) {
        console.error('Login Failed:', error.response?.status, error.response?.data);
    }
}

testLogin();
