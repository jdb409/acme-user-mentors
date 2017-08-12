const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 3000;
const db = require('./models/db');

const app = express();

app.use(require('method-override')('_method'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static('public'));

app.set('view engine', 'html');
app.engine('html', nunjucks.render);
nunjucks.configure('views', { noCache: true });

app.get('/', (req, res, next) => {
    res.render('index');
});

app.use('/users', require('./routes/users'));

app.get((err, req, res, next) => {
    res.render('error', { error: err });
});

db.sync()
    .then(() => {
        console.log('Synced!');
        return db.seed()
            .then(() => {
                console.log('seeded');
            })
            .then(() => {
                app.listen(port, () => {
                    console.log(`listening on port ${port}`);
                });
            });
    });

