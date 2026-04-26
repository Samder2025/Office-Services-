import { db, storage, auth } from "./firebase.js";

import {
  collection, addDoc, getDocs,
  deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const ADMIN = "admin@azm.com";

/* 🔐 حماية */
onAuthStateChanged(auth,(u)=>{
  if(!u || u.email !== ADMIN){
    location = "login.html";
  } else {
    loadAll();
  }
});

/* 🚪 خروج */
window.logout = async () => {
  await signOut(auth);
  location = "login.html";
};

/* 📷 رفع صورة */
async function upload(file){
  const r = ref(storage,"services/"+file.name);
  await uploadBytes(r,file);
  return await getDownloadURL(r);
}

/* ➕ إضافة خدمة */
window.addService = async () => {
  let imgUrl = "";

  if(img.files[0]){
    imgUrl = await upload(img.files[0]);
  }

  await addDoc(collection(db,"services"),{
    name:name.value,
    desc:desc.value,
    full:full.value,
    img:imgUrl,
    date:Date.now()
  });

  loadServices();
};

/* ➕ إضافة مقال */
window.addPost = async () => {
  await addDoc(collection(db,"posts"),{
    title:title.value,
    content:content.value
  });

  loadPosts();
};

/* 🗑 حذف خدمة */
window.deleteService = async (id)=>{
  await deleteDoc(doc(db,"services",id));
  loadServices();
};

/* 🗑 حذف مقال */
window.deletePost = async (id)=>{
  await deleteDoc(doc(db,"posts",id));
  loadPosts();
};

/* 📊 إحصائيات */
async function loadStats(){
  const s = await getDocs(collection(db,"services"));
  const p = await getDocs(collection(db,"posts"));
  const o = await getDocs(collection(db,"orders"));

  stats.innerHTML = `
    <div>📦 الخدمات: ${s.size}</div>
    <div>📝 المقالات: ${p.size}</div>
    <div>🛒 الطلبات: ${o.size}</div>
  `;
}

/* 📦 خدمات */
async function loadServices(){
  const snap = await getDocs(collection(db,"services"));

  services.innerHTML = "";

  snap.forEach(d=>{
    let s = d.data();

    services.innerHTML += `
      <div style="border:1px solid #ccc;padding:10px;margin:10px">
        <img src="${s.img}" width="80"><br>
        <b>${s.name}</b><br>
        ${s.desc}<br>

        <button onclick="deleteService('${d.id}')">حذف</button>
      </div>
    `;
  });
}

/* 📝 مقالات */
async function loadPosts(){
  const snap = await getDocs(collection(db,"posts"));

  posts.innerHTML = "";

  snap.forEach(d=>{
    let p = d.data();

    posts.innerHTML += `
      <div style="margin:10px">
        <b>${p.title}</b>
        <button onclick="deletePost('${d.id}')">حذف</button>
      </div>
    `;
  });
}

/* 🛒 طلبات */
async function loadOrders(){
  const snap = await getDocs(collection(db,"orders"));

  orders.innerHTML = "";

  snap.forEach(d=>{
    let o = d.data();

    orders.innerHTML += `
      <div style="border:1px solid #ddd;padding:10px;margin:5px">
        <b>${o.name}</b><br>
        ${o.service}<br>
        📞 ${o.phone}
      </div>
    `;
  });
}

/* 🔄 تشغيل الكل */
function loadAll(){
  loadStats();
  loadServices();
  loadPosts();
  loadOrders();
}