# הדרך לדולר הראשון: WooCommerce + Stripe + Supliful

עודכן: 2026-11-11

## איך זה עובד (הארכיטקטורה)

Supliful מתחבר רק ל-Shopify. Supliful עצמם מתעדים מסלול "headless": חנות Shopify שמשמשת רק כמנוע הזמנות, והלקוחה בכלל לא רואה אותה. בנינו את זה בתוך התוסף `evenly-core` (מודול `fulfillment-shopify.php`).

```
לקוחה ─► evenlylife.com (WordPress + WooCommerce) ─► משלמת ב-Stripe
                                │  ההזמנה עוברת ל"Processing"
                                ▼
            evenly-core יוצר את אותה הזמנה ב-Shopify (מסומנת PAID)
                                ▼
            Shopify ─► Supliful מייצרים, מדביקים את התווית שלנו, ושולחים
                                ▼
            Shopify שולח webhook ─► WooCommerce: מספר מעקב נשלח ללקוחה במייל, ההזמנה "Completed"
```

**הכסף:** הלקוחה משלמת לך ב-Stripe (המחיר המלא). Supliful מחייבים את הכרטיס ששמור אצלם על עלות המוצר + משלוח. ההפרש = הרווח הגולמי שלך.

**מה כבר בנוי ונבדק** (23/23 בדיקות עוברות ב-WordPress מקומי עם Shopify מדומה, `wordpress/playground/tests/fulfillment-test.php`):
- הזמנה ששולמה נשלחת לבד ברקע (לא מאטה את הצ'קאאוט).
- ערכות (Kits) מתפרקות לפורמולות שבתוכן. "קני 2, קבלי 1 חינם" עובר נכון, כי Supliful מקבלים כמויות ולא מחירים.
- הגנה מכפילויות: הזמנה לא תישלח פעמיים.
- בעיה שדורשת אדם (מוצר לא ממופה, חסר טלפון, כתובת שגויה) → ההזמנה עוברת ל-On hold, נשלח לך מייל התראה, וכפתור "Send to Supliful" שולח מחדש.
- תקלה זמנית (Shopify לא זמין) → עד 5 ניסיונות חוזרים, ואחריהם On hold + מייל.
- מספר מעקב חוזר אוטומטית, החתימה של Shopify (HMAC) נבדקת, ומייל עם המעקב יוצא ללקוחה.
- טלפון חובה בצ'קאאוט, כי Supliful דוחים הזמנות בלי טלפון.
- תמיכה בשתי צורות החיבור של Shopify: אפליקציה מה-Dev Dashboard (client ID + secret, הדרך הנוכחית) או טוקן קבוע (אפליקציות ישנות).

**מה לא נבדק:** חיבור לחנות Shopify אמיתית ו-Supliful אמיתי. לא היו פרטי גישה, ואין לבצע הזמנה אמיתית לצורך בדיקה. הבדיקה האמיתית היא שלב 5 למטה.

---

## המשימות, לפי הסדר

### שלב 0: החלטות שרק את/ה יכול/ה לקבל (חוסם)
- [ ] **פורמולת השינה:** ל-Supliful "Sleep Support" יש מלטונין 10mg, 5-HTP ו-St. John's Wort. St. John's Wort עלול להפחית יעילות של גלולות למניעת הריון ומגיב עם תרופות נוגדות דיכאון. לקהל של נשים זה סיכון אמיתי. אפשרויות: פורמולה אחרת מהקטלוג, או להשיק בלי Sleep ולהוסיף אחר כך.
- [ ] **ישות משפטית + כתובת** (LLC אמריקאי או החברה שלך): נדרש לתווית ("Distributed by"), לדפים המשפטיים ול-Stripe.
- [ ] **Calm:** Ashwagandha רגיל או "Ashwagandha Plus" (עם maca, ginseng ועוד). התוכן באתר צריך להתאים בדיוק למה שעל התווית.
- [ ] **Unwind (מגנזיום):** לאתר את המוצר המדויק בקטלוג Supliful.

> טיפ: אפשר להשיק עם 4 המוצרים שכבר מאומתים (Cycle, Digest, Flora, Restore) + ה-Gut Reset, ולהוסיף את השאר כשמוכנים. מוצר שלא מופה פשוט לא יישלח (ההזמנה תיעצר ב-On hold), אז עדיף להסתיר אותו (Draft) עד שהוא מוכן.

### שלב 1: דומיין ואחסון (יום 1)
- [ ] הדומיין `evenlylife.com`: לוודא שהוא רשום על שמך ושתיבת `support@evenlylife.com` מקבלת מיילים.
- [ ] אחסון WordPress מנוהל (SiteGround / Hostinger / Cloudways), PHP 8.2+, SSL.
- [ ] התקנת WordPress + WooCommerce.
- [ ] העלאת `dist/evenly-theme.zip` ו-`dist/evenly-core.zip` (גרסה 1.2.0 כוללת את הגשר), ואז Tools → Evenly Setup → Import.
- [ ] Settings → Evenly: ישות משפטית, כתובת, מדינת חוק.
- [ ] אבטחה: `docs/WORDPRESS-SECURITY.md` (Wordfence, 2FA, גיבויים).
- פירוט מלא: `docs/INSTALL-NEW-SITE.md`

### שלב 2: Stripe (יום 1–2)
- [ ] Plugins → Add New → **"WooCommerce Stripe Payment Gateway"** (התוסף הרשמי של WooCommerce) → Connect עם החשבון שלך.
- [ ] להתחיל ב-**Test mode**.
- [ ] להפעיל Apple Pay / Google Pay / Link (משפרים המרה במובייל).
- [ ] Statement descriptor: `EVENLY` (כך זה יופיע בדף החיוב של הלקוחה, ומפחית chargebacks).
- [ ] Radar: להשאיר את חוקי ברירת המחדל.
- [ ] Stripe Dashboard → פרטי עסק: אתר, כתובת, מדיניות החזרים. Stripe בודקים שהאתר מציג מדיניות החזרים ופרטי קשר, ואצלנו זה קיים.
- הערה: מנויים/trial בתחום התוספים מסומנים אצל ספקי סליקה כסיכון גבוה. אצלנו אין מנויים, וזה טוב.

### שלב 3: Shopify כמנוע הזמנות + Supliful (יום 2–3)
- [ ] לפתוח חנות Shopify. התוכנית צריכה לאפשר התקנת אפליקציות; לבדוק במחיר העדכני. להשאיר את החנות **עם סיסמה** (Online Store → Preferences → Password), כדי שאף לקוחה לא תגיע אליה.
- [ ] Supliful: מנוי **Pro** (לפי Supliful, $69 לחודש), ואמצעי תשלום שמור אצלם.
- [ ] להתקין את אפליקציית Supliful ב-Shopify ולחבר לחשבון.
- [ ] ב-Supliful: לבנות כל מוצר עם התווית שלנו (Sleep מוכנה ב-`brand/labels/supliful-upload/`, ולשאר צריך את התבניות שלהם), ואז **Publish to Shopify**.
  - חשוב: רק מוצרים שפורסמו מ-Supliful נשלחים. מוצר שנוצר ידנית ב-Shopify לא יישלח.
- [ ] Shopify → Settings → Checkout → Order processing → **"Automatically fulfill the order's line items"**.
- [ ] Shopify → Settings → Shipping and delivery → אזור "Supliful Fulfillment": להגדיר אזור משלוח ל-US.
- [ ] **אפליקציה לחיבור:** Shopify Dev Dashboard → Create app → הרשאות: `read/write_products`, `read/write_orders`, `read/write_customers`, `read/write_fulfillments` → להתקין על החנות → להעתיק **Client ID** ו-**Client secret**.
- [ ] WordPress → **WooCommerce → Supliful**:
  1. Shopify store domain: `xxxx.myshopify.com`
  2. Client ID + Client secret (או טוקן `shpat_` אם האפליקציה מציגה כזה)
  3. **Test connection** (צריך להופיע "Connected to …")
  4. **Load Shopify products** → להעתיק את ה-Variant ID של כל מוצר לטבלת המיפוי: `EV-CYCLE | 44012345678901`
  5. לוודא שבטבלה "Product mapping status" כל המוצרים הפעילים עם ✓
- [ ] Shopify → Settings → Notifications → **Webhooks** → Create webhook (JSON), לכתובת שמוצגת בעמוד ההגדרות:
  - Fulfillment creation
  - Fulfillment update
  - Order cancellation
  - להעתיק את ה-signing key שמופיע שם לשדה "Webhook signing secret".
- [ ] לסמן **Enable**. בהתחלה מומלץ **בלי** "Send automatically", כדי לאשר כל הזמנה ידנית בשבוע הראשון.

### שלב 4: בדיקת תשלום (בלי משלוח אמיתי)
- [ ] כש-Supliful **כבוי** (Enable לא מסומן): הזמנה עם כרטיס בדיקה של Stripe `4242 4242 4242 4242`.
- [ ] לבדוק: מייל אישור, הנחת 2+1, משלוח חינם מעל $50, תיבת אישור הבטיחות, ההזמנה ב-Processing.
- [ ] החזר כספי (Refund) מתוך WooCommerce, ולוודא שהוא מגיע ל-Stripe.

### שלב 5: הזמנה אמיתית ראשונה (שלך, אליך)
- [ ] Stripe → Live mode.
- [ ] Supliful → Enable (עדיין ידני).
- [ ] לקנות **בעצמך** מוצר אחד בכרטיס אמיתי, לכתובת אמריקאית שלך או של מכר/ה.
- [ ] בהזמנה: Order actions → **Send to Supliful**. בהערות ההזמנה אמור להופיע "Sent to Supliful via Shopify order #…".
- [ ] ב-Shopify: ההזמנה מופיעה כ-Paid, ובקשת ה-fulfillment מתקדמת. ב-Supliful: ההזמנה בטיפול, והחיוב על עלות המוצר + משלוח.
- [ ] כשנשלח: מייל מעקב מגיע ללקוחה, וההזמנה ב-WooCommerce עוברת ל-Completed.
- [ ] לבדוק את החשבונית של Shopify אחרי ההזמנה הראשונה: האם נגבתה עמלה על הזמנה שנוצרה דרך API בלי Shopify Payments. **לא אימתנו את זה.**
- [ ] אם הכול תקין → להפעיל **Send automatically**.

### שלב 6: עלייה לאוויר
- [ ] `SITE_INDEXABLE` / Settings → Reading: לאפשר אינדוקס.
- [ ] GA4 + Meta Pixel IDs ב-Settings → Evenly (כבר מחוברים ומכבדים הסכמה).
- [ ] Google Search Console + sitemap (Rank Math).
- [ ] לעבור על `docs/LAUNCH-CHECKLIST.md`.

---

## חשבון הרווח: מה למלא לפני שמוציאים כסף על פרסום
לא הכנסנו כאן מספרים שלא אומתו. לכל מוצר יש לקחת מ-Supliful את עלות הבסיס + משלוח:

| | Cycle | Digest | Flora | Restore |
|---|---|---|---|---|
| מחיר באתר | $36 | $34 | $39 | $35 |
| עלות Supliful (מוצר) | ? | ? | ? | ? |
| משלוח Supliful | ? | ? | ? | ? |
| עמלת Stripe (≈2.9% + 30¢) | $1.34 | $1.29 | $1.43 | $1.32 |
| **רווח גולמי** | ? | ? | ? | ? |

- ב-"קני 2, קבלי 1 חינם" את משלמת ל-Supliful על **3** יחידות ומקבלת תשלום על 2. חובה לבדוק שזה עדיין רווחי לפני שמפעילים פרסום.
- עלויות קבועות לחודש: Supliful Pro, Shopify, אחסון, דומיין.

## מה עדיין פתוח אצלנו (קוד)
- תוויות לשאר המוצרים: צריך את קבצי התבנית (.ai) מ-Supliful לכל מוצר, ו-`scripts/brand/build_label.py` ייצר אותן.
- כשיגיעו תמונות אמיתיות של המוצרים: להחליף את ה-"Packaging render".
