# إعداد Google Maps API Key

## خطوات إنشاء API Key

### 1. إنشاء API Key

1. **Name**: اكتب اسم واضح مثل `Form Builder Maps API Key`
2. **Authenticate API calls through a service account**: اتركه **غير مفعّل** (لا تحتاجه)
3. **Restrict your key**: **فعّل هذا الخيار** للأمان

### 2. Application Restrictions (قيود التطبيق)

اختر **"Websites"** (المواقع الإلكترونية)

ثم أضف:
- `http://localhost:3000/*` (للتطوير المحلي)
- `https://yourdomain.com/*` (للموقع النهائي - استبدل `yourdomain.com` باسم موقعك)

**مثال:**
```
http://localhost:3000/*
https://myformbuilder.com/*
```

### 3. API Restrictions (قيود API)

اختر **"Restrict key"** ثم حدد فقط هذه الـ APIs:

- ✅ **Maps JavaScript API** (مطلوب لعرض الخرائط)
- ✅ **Geocoding API** (مطلوب للحصول على العناوين من الإحداثيات)

**لا تفعّل APIs أخرى** - هذا يزيد الأمان ويقلل التكلفة.

### 4. حفظ المفتاح

1. اضغط **"Create"** أو **"Save"**
2. انسخ المفتاح الذي تم إنشاؤه
3. أضفه إلى ملف `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
```

### 5. تفعيل الـ APIs المطلوبة (مهم جداً!)

**قبل إنشاء API Key، يجب تفعيل الـ APIs أولاً:**

1. اذهب إلى **APIs & Services** → **Library** (أو ابحث عن "APIs" في القائمة الجانبية)
2. ابحث في شريط البحث عن **"Maps JavaScript API"**
3. اضغط على **"Maps JavaScript API"** → اضغط **Enable**
4. ابحث عن **"Geocoding API"**
5. اضغط على **"Geocoding API"** → اضغط **Enable**

**بعد تفعيل الـ APIs، ارجع لإنشاء API Key وستجدهم في القائمة.**

## ملاحظات مهمة

### الأمان
- ✅ **فعّل القيود** دائماً
- ✅ **حدد فقط الـ APIs المطلوبة**
- ✅ **أضف فقط المواقع التي تحتاجها**
- ❌ **لا تشارك المفتاح** في الكود العام (GitHub public repos)

### التكلفة
- Google Maps توفر **$200 مجاناً شهرياً**
- هذا يكفي لـ **28,000 طلب خريطة** و **40,000 طلب Geocoding**
- للمشاريع الصغيرة والمتوسطة، هذا كافٍ تماماً

### للمطورين
- استخدم `localhost:3000` للتطوير
- أضف نطاق الإنتاج عند النشر
- يمكنك إضافة عدة نطاقات في نفس المفتاح

## التحقق من الإعداد

بعد إضافة المفتاح إلى `.env.local`:

1. أعد تشغيل السيرفر: `npm run dev`
2. افتح النموذج مع حقل موقع
3. يجب أن تظهر الخريطة بدون أخطاء

إذا ظهرت رسالة خطأ، تحقق من:
- ✅ المفتاح موجود في `.env.local`
- ✅ الـ APIs مفعّلة في Google Cloud Console
- ✅ القيود تسمح بـ `localhost:3000`
- ✅ أعد تشغيل السيرفر بعد إضافة المفتاح

