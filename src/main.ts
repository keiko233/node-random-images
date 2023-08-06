import Koa from 'koa';
import Router from 'koa-router';
import * as fs from 'fs';
import * as path from 'path';
import serve from 'koa-static';
import mount from 'koa-mount';

const app = new Koa();
const router = new Router();

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

router.get('/', (ctx) => {
  const randomImagePath = ctx.query.p || getRandomImagePath();
  const imagesDir = path.join(process.cwd(), 'data', randomImagePath);
  const images = fs.readdirSync(imagesDir);
  const randomIndex = Math.floor(Math.random() * images.length);
  const randomImage = images[randomIndex];
  const imagePath = path.join(imagesDir, randomImage);

  if (ctx.query.m === 'json') {
    const response = [
      {
        path: getImagePath(randomImagePath, randomImage),
        url: getImageUrl(randomImagePath, randomImage)
      }
    ];
    ctx.body = { response };
    ctx.type = 'application/json';
  } else if (ctx.query.m === 'base64') {
    const image = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(image).toString('base64');
    const response = [
      {
        path: getImagePath(randomImagePath, randomImage),
        url: getImageUrl(randomImagePath, randomImage),
        content: base64Image
      }
    ];
    ctx.body = { response };
    ctx.type = 'application/json';
  } else {
    ctx.type = path.extname(randomImage);
    ctx.body = fs.createReadStream(imagePath);
  }
});

router.get('/help.html', async (ctx) => {
  const htmlPath = path.join(process.cwd(), config.htmlPath);
  ctx.type = 'html';
  ctx.body = fs.createReadStream(htmlPath);
});

router.get('/help', async (ctx) => {
  const htmlPath = path.join(process.cwd(), config.htmlPath);
  ctx.type = 'html';
  ctx.body = fs.createReadStream(htmlPath);
});

function getRandomImagePath() {
  const randomIndex = Math.floor(Math.random() * config.imagePaths.length);
  return config.imagePaths[randomIndex];
}

function getImagePath(imagePath, imageName) {
  return path.join('/', imagePath, imageName);
}

function getImageUrl(imagePath, imageName) {
  return `http://localhost:${config.port}${getImagePath(imagePath, imageName)}`;
}

app.use(mount('/resources', serve('data')));
app.use(router.routes());

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});