const micromq = require('micromq');
const sqlite3 = require('sqlite3').verbose();;
const { RABBIT_URL } = require('./config');

const db = new sqlite3.Database('mydatabase.db');

const app = new micromq({
    name: 'users',
    rabbit: {
        url: RABBIT_URL,
    },
});

app.get('/friends', (req,res) => {
    db.all("SELECT id, name FROM users", (err, rows) => {
        if(err){
            console.error(err.message);
            res.status(500).json({error: "Ошибка обработки сервера"});
        }else {
            res.json(rows);
        }
    });
});

app.get('/status', (req, res) => {
    res.json({
      text: 'Thinking...',
    });
  });

app.get('/new_friends',(req,res) => {
    const {id,name} = req.query;

    if (!id || !name) {
        return res.status(400).json({error:"Нет Id или name"});
    }

    db.run("INSERT INTO users (id,name) VALUES (?,?)", [id,name],function(err) {
        console.error(err);
        return res.status(500).json({error:'Ошибка записи на сервере'}); 
    })

    res.json({message: "Клиент добавлен"});
})

app.on('friends', async (message, properties, actions) => {
    console.log('Получено сообщение из RabbitMQ:', message);
    actions.send({ text: 'Сообщение успешно обработано' });
});
  
  app.start();