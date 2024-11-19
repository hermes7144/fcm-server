const express = require('express');
require('dotenv').config();
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors'); // CORS 미들웨어 추가

// Firebase Admin SDK 초기화
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Express 앱 설정
const app = express();
const port = 3000;

// Body Parser 설정
app.use(cors()); // 모든 도메인에서 요청을 허용
app.use(bodyParser.json());

// 기본 경로
app.get('/', (req, res) => {
  res.send('Firebase Push Notification Server');
});

// 푸시 알림을 보내는 API

app.post('/send-notification', (req, res) => {
  const { token, title, body } = req.body;
    
  if (!token || !title || !body) {
    return res.status(400).send('유효하지 않은 요청 데이터');
  }

  const message = {
    token: token, // 여기서 token을 전달
    notification: {
      title: title,
      body: body,
    },
  };

  // FCM 메시지 전송
  admin.messaging().send(message)
    .then((response) => {
      res.status(200).send('푸시 알림 전송 성공: ' + response);
    })
    .catch((error) => {
      console.error('푸시 알림 전송 실패:', error);
      res.status(500).send('푸시 알림 전송 실패: ' + error);
    });
});

// 서버 시작
app.listen(port, () => {
  console.log(`FCM 서버가 http://localhost:${port}에서 실행 중입니다.`);
});
