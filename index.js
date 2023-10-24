const Gateway = require('micromq/gateway');
const { RABBIT_URL } = require('./config');

PORT = 8000;

const app = new Gateway({
    microservices: ['users'],
    rabbit: {
        url: RABBIT_URL,
    },
});


app.get(['/friends','/status'], async (req,res) => {
    await res.delegate('users');
});

app.get('/new_friends', async (req, res) => {
    const { id, name } = req.query;

    const response = await res.delegate('users', {
        method: 'GET',
        path: '/new_friends',
        query: { id, name },
    });

    res.json(response);
});


app.listen(PORT);