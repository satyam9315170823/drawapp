import { WebSocketServer } from 'ws';
import jwt, { JwtPayload }  from 'jsonwebtoken';
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws,request) {
  
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const decoded = jwt.verify(token,"12345");


  if (!decoded || !(decoded as JwtPayload ).userId) {
    ws.close()
    return null;
  }

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});