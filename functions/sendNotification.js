const admin = require('firebase-admin');

// Firebase Admin SDK 초기화 (중복 초기화 방지)
if (admin.apps.length === 0) {

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
}

exports.handler = async (event, context) => {

  // OPTIONS 메서드에 대한 응답
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // 모든 도메인 허용
        'Access-Control-Allow-Headers': 'Content-Type', // 요청 헤더 허용
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', // 허용된 HTTP 메서드
      },
    };
  }
  const { tokens, title, body } = JSON.parse(event.body); // JSON 파싱

  try {
    const message = {
      notification: {
        title,
        body,
      },
      tokens
    };

    const response = admin.messaging().sendEachForMulticast(message);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // 모든 도메인 허용
      },
      body: JSON.stringify({ message: 'Success', response }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Something went wrong!', details: error.message }),
    };
  }
};
