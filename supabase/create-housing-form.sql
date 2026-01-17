-- SQL Script to Create Housing Ownership Request Form
-- Run this in Supabase SQL Editor
-- This will create the form with 30 fields including 2 interactive map location pickers
-- The form uses natural, conversational language to better understand users

    -- First, create the form
    DO $$
    DECLARE
    form_id_var UUID;
    BEGIN
    -- Check if form already exists, if so delete it first
    DELETE FROM forms WHERE public_url = 'housing-request-form';
    
    -- Insert the form
    INSERT INTO forms (
        name,
        description,
        status,
        public_url,
        media_type,
        media_url 
    ) VALUES (
        'نموذج طلب امتلاك مسكن (للمكتريين)',
        'نموذج شامل لطلب امتلاك مسكن للمستأجرين',
        'active',
        'housing-request-form',
        'none',
        NULL
    )
    RETURNING id INTO form_id_var;

    -- Now insert all fields in order
    
  -- Section 1: Personal Information (7 fields)
  INSERT INTO fields (form_id, label, type, required, placeholder, options, "order", enabled) VALUES
    (form_id_var, 'الاسم الكامل', 'text', true, 'أدخل اسمك الكامل', NULL, 1, true),
    (form_id_var, 'رقم الهاتف', 'phone', true, '+216 XX XXX XXX', NULL, 2, true),
    (form_id_var, 'البريد الإلكتروني', 'email', true, 'example@email.com', NULL, 3, true),
    (form_id_var, 'الفئة العمرية', 'select', true, NULL, '["أقل من 25", "25-35", "36-45", "46-55", "أكثر من 55"]'::jsonb, 4, true),
    (form_id_var, 'الحالة العائلية', 'select', true, NULL, '["أعزب", "متزوج", "مطلق", "أرمل"]'::jsonb, 5, true),
    (form_id_var, 'عدد أفراد الأسرة', 'number', true, 'عدد أفراد الأسرة', NULL, 6, true),
    (form_id_var, 'المهنة / القطاع', 'select', true, NULL, '["موظف حكومي", "موظف خاص", "صاحب عمل", "طالب", "متقاعد", "غير ذلك"]'::jsonb, 7, true);

  -- Section 2: Current Housing Information (6 fields)
  INSERT INTO fields (form_id, label, type, required, placeholder, options, "order", enabled) VALUES
    (form_id_var, 'موقع السكن الحالي', 'location', true, 'اضغط على الخريطة لتحديد موقع سكنك الحالي بدقة', NULL, 8, true),
    (form_id_var, 'نوع السكن الحالي', 'select', true, NULL, '["كراء", "سكن عائلي", "سكن وظيفي"]'::jsonb, 9, true),
    (form_id_var, 'قيمة الكراء الشهري', 'number', true, 'بالدينار التونسي', NULL, 10, true),
    (form_id_var, 'مدة الكراء الحالية', 'select', true, NULL, '["أقل من سنة", "1–3 سنوات", "أكثر من 3 سنوات"]'::jsonb, 11, true),
    (form_id_var, 'ما هي أكبر التحديات في سكنك الحالي؟', 'checkbox', false, NULL, '["السعر مرتفع", "البعد عن العمل", "صغر المساحة", "عدم الاستقرار", "غياب الخصوصية", "مشاكل في الحي", "غير ذلك"]'::jsonb, 12, true),
    (form_id_var, 'لماذا تريد الانتقال لمسكن جديد؟', 'textarea', false, 'شاركنا سبب رغبتك في الانتقال (اختياري)', NULL, 13, true);

  -- Section 3: Desired Future Housing (6 fields)
  INSERT INTO fields (form_id, label, type, required, placeholder, options, "order", enabled) VALUES
    (form_id_var, 'الموقع المرغوب لاقتناء المسكن', 'location', true, 'اضغط على الخريطة لتحديد الموقع المرغوب لاقتناء المسكن بدقة', NULL, 14, true),
    (form_id_var, 'نوع المسكن المطلوب', 'checkbox', true, NULL, '["شقة", "منزل", "فيلا", "قطعة أرض"]'::jsonb, 15, true),
    (form_id_var, 'المساحة المطلوبة (تقريباً)', 'select', false, NULL, '["أقل من 60 م²", "60-90 م²", "90-120 م²", "120-150 م²", "أكثر من 150 م²"]'::jsonb, 16, true),
    (form_id_var, 'ما هو الأهم بالنسبة لك؟', 'checkbox', false, NULL, '["السعر المناسب", "الموقع القريب", "المساحة الكبيرة", "الخصوصية", "قرب المدارس", "النقل العام", "الأمان", "الخدمات"]'::jsonb, 17, true),
    (form_id_var, 'الغرض من السكن', 'select', true, NULL, '["سكن شخصي", "استثمار", "الاثنين"]'::jsonb, 18, true);

  -- Section 4: Budget and Financial Capacity (6 fields)
  INSERT INTO fields (form_id, label, type, required, placeholder, options, "order", enabled) VALUES
    (form_id_var, 'الميزانية القصوى المتوقعة', 'number', true, 'بالدينار التونسي', NULL, 19, true),
    (form_id_var, 'ما هي نسبة الدفعة الأولى المتوقعة؟', 'select', false, NULL, '["أقل من 10%", "10-20%", "20-30%", "30-40%", "أكثر من 40%", "لا أعرف بعد"]'::jsonb, 20, true),
    (form_id_var, 'طريقة التمويل', 'checkbox', true, NULL, '["تمويل بنكي", "دفع ذاتي", "الاثنين"]'::jsonb, 21, true),
    (form_id_var, 'الدخل الشهري التقريبي', 'number', true, 'بالدينار التونسي', NULL, 22, true),
    (form_id_var, 'هل يوجد قرض حالي؟', 'select', true, NULL, '["نعم", "لا"]'::jsonb, 23, true),
    (form_id_var, 'في صورة نعم، قيمة القسط الشهري', 'number', false, 'بالدينار التونسي', NULL, 24, true);

  -- Section 5: Readiness and Seriousness (4 fields)
  INSERT INTO fields (form_id, label, type, required, placeholder, options, "order", enabled) VALUES
    (form_id_var, 'متى تنوي اقتناء المسكن؟', 'select', true, NULL, '["فوراً (أقل من 3 أشهر)", "قريباً (3-6 أشهر)", "خلال السنة القادمة (6-12 شهر)", "أكثر من سنة", "أستكشف فقط"]'::jsonb, 25, true),
    (form_id_var, 'هل سبق لك التقدم بطلب تمويل؟', 'select', true, NULL, '["نعم", "لا"]'::jsonb, 26, true),
    (form_id_var, 'كيف تفضل التواصل معنا؟', 'select', false, NULL, '["الهاتف", "البريد الإلكتروني", "الواتساب", "أي طريقة"]'::jsonb, 27, true),
    (form_id_var, 'هل ترغب في التواصل مع مستشار؟', 'select', true, NULL, '["نعم، بالتأكيد", "نعم، ربما", "لا، شكراً"]'::jsonb, 28, true);

  -- Section 6: Additional Information (2 fields)
  INSERT INTO fields (form_id, label, type, required, placeholder, options, "order", enabled) VALUES
    (form_id_var, 'متطلبات خاصة (قرب مدارس، نقل، عمل…)', 'textarea', false, 'اذكر أي متطلبات خاصة أو أولويات إضافية', NULL, 29, true),
    (form_id_var, 'هل هناك شيء آخر تود إخبارنا به؟', 'textarea', false, 'أي معلومات إضافية قد تساعدنا في مساعدتك بشكل أفضل', NULL, 30, true);

    RAISE NOTICE 'Form created successfully with ID: %', form_id_var;
    RAISE NOTICE 'Public URL: /form/housing-request-form';
    END $$;

    -- Verify the form was created
    SELECT 
    f.id,
    f.name,
    f.public_url,
    f.status,
    COUNT(fi.id) as field_count
    FROM forms f
    LEFT JOIN fields fi ON fi.form_id = f.id
    WHERE f.public_url = 'housing-request-form'
    GROUP BY f.id, f.name, f.public_url, f.status;
