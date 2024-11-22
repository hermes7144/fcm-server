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

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

exports.handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // 모든 도메인 허용
    'Access-Control-Allow-Headers': '*', // 모든 헤더 허용
    'Access-Control-Allow-Methods': '*', // 모든 HTTP 메서드 허용
  };

  // CORS Preflight 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
    };
  }

  try {
    const { tokens, title, body } = JSON.parse(event.body); // 요청 바디 파싱

    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log("Messages sent successfully:", response.successCount);
    console.log("Messages failed:", response.failureCount);

    response.responses.forEach((res, idx) => {
      if (res.success) {
        console.log(`Message to token[${idx}] succeeded: ${res.messageId}`);
      } else {
        console.error(`Message to token[${idx}] failed: ${res.error}`);
      }
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: 'Messages sent successfully!' }),
    };
  } catch (error) {
    console.error("Error sending messages:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Something went wrong!', details: error.message }),
    };
  }
};
