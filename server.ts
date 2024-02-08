import {app, logger} from './main';

const port = process.env.PORT ||  3001;

app.listen(port, ()=>{
    logger.info(`Server started at ${port}`);
})