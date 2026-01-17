# دليل سريع: إعداد Google Maps API Key

## المشكلة: لا أرى Maps APIs في القائمة

إذا لم تظهر **"Maps JavaScript API"** و **"Geocoding API"** في قائمة API restrictions، فهذا يعني أنهم **لم يتم تفعيلهم بعد**.

## الحل: خطوة بخطوة

### الخطوة 1: تفعيل الـ APIs أولاً

1. من Google Cloud Console، اذهب إلى:
   - **APIs & Services** → **Library**
   - أو ابحث في شريط البحث العلوي عن "APIs"

2. ابحث عن **"Maps JavaScript API"**:
   - اكتب في شريط البحث: `Maps JavaScript API`
   - اضغط على النتيجة
   - اضغط **Enable** (تفعيل)

3. ابحث عن **"Geocoding API"**:
   - اكتب في شريط البحث: `Geocoding API`
   - اضغط على النتيجة
   - اضغط **Enable** (تفعيل)

### الخطوة 2: إنشاء API Key

بعد تفعيل الـ APIs، ارجع إلى:

1. **APIs & Services** → **Credentials**
2. اضغط **Create Credentials** → **API Key**
3. الآن في قائمة **API restrictions**، ابحث عن:
   - ✅ **Maps JavaScript API** (يجب أن يظهر الآن)
   - ✅ **Geocoding API** (يجب أن يظهر الآن)

### الخطوة 3: إعدادات API Key

**Name:**
```
Form Builder Maps Key
```

**Application restrictions:**
- اختر: **Websites**
- أضف: `http://localhost:3000/*`

**API restrictions:**
- اختر: **Restrict key**
- حدد فقط:
  - ✅ **Maps JavaScript API**
  - ✅ **Geocoding API**

### الخطوة 4: حفظ المفتاح

1. اضغط **Save** أو **Create**
2. انسخ المفتاح
3. أضفه إلى `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
   ```
4. أعد تشغيل السيرفر: `npm run dev`

## ملاحظة مهمة

إذا لم تجد **"Maps JavaScript API"** في Library:
- تأكد أنك في المشروع الصحيح
- جرب البحث بـ: `Maps` أو `JavaScript API`
- تأكد من أن الـ API متاح في منطقتك

## التحقق من النجاح

بعد إضافة المفتاح:
1. افتح النموذج مع حقل موقع
2. يجب أن تظهر الخريطة بدون أخطاء
3. إذا ظهرت رسالة خطأ، تحقق من:
   - ✅ المفتاح موجود في `.env.local`
   - ✅ الـ APIs مفعّلة
   - ✅ القيود تسمح بـ `localhost:3000`
   - ✅ أعد تشغيل السيرفر

