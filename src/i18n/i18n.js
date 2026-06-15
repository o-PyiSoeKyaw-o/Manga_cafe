import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      nav: { home: 'Home', webtoons: 'Webtoons', anime: 'Anime', dashboard: 'Dashboard', login: 'Log In', signup: 'Sign Up', search: 'Search...', profile: 'Profile', logout: 'Log Out', bookmarks: 'Bookmarks', settings: 'Settings' },
      home: { trending: 'Trending & Popular', popular: 'Popular', new_originals: 'Newly Released', daily: 'Daily Schedule', by_category: 'Popular by Category', view_all: 'View all', new_episode: 'New Episode', continue_reading: 'Continue Reading', recently_viewed: 'Recently Viewed' },
      series: { episodes: 'Episodes', subscribe: 'Subscribe', subscribed: 'Subscribed', read: 'Read', views: 'Views', likes: 'Likes', status: { ongoing: 'Ongoing', completed: 'Completed', hiatus: 'Hiatus' }, schedule: 'Every', description: 'Description', reviews: 'Reviews', you_may_like: 'You may also like' },
      episode: { locked: 'Locked', unlock: 'Unlock', coins: 'Coins', free: 'Free', episode: 'Episode', like: 'Like', liked: 'Liked' },
      anime: { now_streaming: 'Now Streaming', trending: 'Trending Anime', featured: 'Featured', watch: 'Watch', minutes: 'min' },
      auth: { login: 'Log In', signup: 'Sign Up', email: 'Email', username: 'Username', password: 'Password', confirm_password: 'Confirm Password', phone: 'Phone Number (optional)', login_success: 'Welcome back!', register_success: 'Account created!', logout_success: 'Logged out', no_account: "Don't have an account?", have_account: 'Already have an account?' },
      dashboard: { overview: 'Overview', my_works: 'My Works', webtoons: 'Webtoons', anime: 'Anime', total_views: 'Total Views', total_likes: 'Total Likes', total_episodes: 'Total Episodes', upload: 'Upload', create_series: 'Create Series', reading_history: 'Reading History', watch_history: 'Watch History', coin_balance: 'Coin Balance' },
      coins: { balance: 'Balance', buy: 'Buy Coins', transactions: 'Transactions', earned: 'Earned', spent: 'Spent', bonus: 'Bonus', packages: 'Coin Packages' },
      reviews: { write: 'Write a Review', rating: 'Rating', helpful: 'Helpful', no_reviews: 'No reviews yet. Be the first!', submit: 'Submit Review' },
      common: { loading: 'Loading...', error: 'Something went wrong', retry: 'Retry', cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit', close: 'Close', back: 'Back', next: 'Next', prev: 'Previous', share: 'Share', download: 'Download', offline: 'Saved Offline', dark_mode: 'Dark Mode', light_mode: 'Light Mode', language: 'Language' },
    }
  },
  my: {
    translation: {
      nav: { home: 'ပင်မ', webtoons: 'ဝပ်တွန်', anime: 'အနိမေး', dashboard: 'ဒက်ရှ်ဘုတ်', login: 'ဝင်ရောက်', signup: 'အကောင့်ဖွင့်', search: 'ရှာဖွေရန်...', profile: 'ပရိုဖိုင်', logout: 'ထွက်ရန်', bookmarks: 'မှတ်သားချက်', settings: 'ဆက်တင်' },
      home: { trending: 'ခေတ်စားနေသော', popular: 'လူကြိုက်များ', new_originals: 'အသစ်ထွက်', daily: 'နေ့စဉ်ဇယား', by_category: 'အမျိုးအစားအလိုက်', view_all: 'အားလုံးကြည့်', new_episode: 'အသစ်', continue_reading: 'ဆက်ဖတ်ရန်', recently_viewed: 'မကြာမီကြည့်ခဲ့သော' },
      series: { episodes: 'ပိုင်းများ', subscribe: 'စာရင်းသွင်း', subscribed: 'သွင်းပြီး', read: 'ဖတ်ရန်', views: 'ကြည့်ရှုမှု', likes: 'ကြိုက်နှစ်သက်', status: { ongoing: 'ဆက်လက်ရေးသော', completed: 'ပြီးဆုံးသော', hiatus: 'ခဏရပ်နားသော' }, schedule: 'တိုင်း', description: 'အကြောင်းအရာ', reviews: 'သုံးသပ်ချက်', you_may_like: 'ကြိုက်နှစ်သက်နိုင်သော' },
      episode: { locked: 'သော့ပိတ်', unlock: 'သော့ဖွင့်', coins: 'ကွင်း', free: 'အခမဲ့', episode: 'ပိုင်း', like: 'ကြိုက်', liked: 'ကြိုက်ပြီ' },
      anime: { now_streaming: 'လက်ရှိပြသနေသော', trending: 'ခေတ်စားသောအနိမေး', featured: 'ထူးချွန်သော', watch: 'ကြည့်ရန်', minutes: 'မိနစ်' },
      auth: { login: 'ဝင်ရောက်', signup: 'အကောင့်ဖွင့်', email: 'အီးမေးလ်', username: 'အမည်', password: 'စကားဝှက်', confirm_password: 'စကားဝှက်အတည်ပြု', phone: 'ဖုန်းနံပါတ် (ရွေးချယ်နိုင်)', login_success: 'ကြိုဆိုပါသည်!', register_success: 'အကောင့်ဖွင့်ပြီး!', logout_success: 'ထွက်လိုက်ပြီ', no_account: 'အကောင့်မရှိသေးဘူးလား?', have_account: 'အကောင့်ရှိပြီးသားလား?' },
      dashboard: { overview: 'အနှစ်ချုပ်', my_works: 'ကျွန်ုပ်၏လက်ရာများ', webtoons: 'ဝပ်တွန်', anime: 'အနိမေး', total_views: 'စုစုပေါင်းကြည့်ရှုမှု', total_likes: 'စုစုပေါင်းကြိုက်', total_episodes: 'စုစုပေါင်းပိုင်း', upload: 'တင်ရန်', create_series: 'စီးရီးဖန်တီး', reading_history: 'ဖတ်မှတ်တမ်း', watch_history: 'ကြည့်မှတ်တမ်း', coin_balance: 'ကွင်းလက်ကျန်' },
      coins: { balance: 'လက်ကျန်', buy: 'ကွင်းဝယ်', transactions: 'ငွေပေးငွေယူ', earned: 'ရရှိ', spent: 'သုံးစွဲ', bonus: 'ဘောနပ်', packages: 'ကွင်းပက်ကေ့ချ်' },
      reviews: { write: 'သုံးသပ်ချက်ရေးရန်', rating: 'အဆင့်သတ်မှတ်', helpful: 'အသုံးဝင်', no_reviews: 'သုံးသပ်ချက်မရှိသေးပါ', submit: 'တင်ရန်' },
      common: { loading: 'တင်နေသည်...', error: 'အမှားဖြစ်နေသည်', retry: 'ထပ်စမ်း', cancel: 'ပယ်ဖျက်', save: 'သိမ်းဆည်း', delete: 'ဖျက်', edit: 'ပြင်ဆင်', close: 'ပိတ်', back: 'နောက်သို့', next: 'ရှေ့သို့', prev: 'နောက်', share: 'မျှဝေ', download: 'ဒေါင်းလုတ်', offline: 'အော့ဖ်လိုင်းသိမ်း', dark_mode: 'မှောင်မိုဒ်', light_mode: 'အလင်းမိုဒ်', language: 'ဘာသာစကား' },
    }
  },
  ja: {
    translation: {
      nav: { home: 'ホーム', webtoons: 'ウェブトゥーン', anime: 'アニメ', dashboard: 'ダッシュボード', login: 'ログイン', signup: '登録', search: '検索...', profile: 'プロフィール', logout: 'ログアウト' },
      home: { trending: 'トレンド＆人気', popular: '人気', view_all: 'すべて見る', new_episode: '新エピソード' },
      common: { loading: '読み込み中...', error: 'エラーが発生しました', dark_mode: 'ダークモード', light_mode: 'ライトモード', language: '言語' },
    }
  },
  ko: {
    translation: {
      nav: { home: '홈', webtoons: '웹툰', anime: '애니메이션', dashboard: '대시보드', login: '로그인', signup: '회원가입', search: '검색...', profile: '프로필', logout: '로그아웃' },
      home: { trending: '인기 시리즈', popular: '인기', view_all: '전체 보기', new_episode: '새 에피소드' },
      common: { loading: '로딩 중...', error: '오류가 발생했습니다', dark_mode: '다크 모드', light_mode: '라이트 모드', language: '언어' },
    }
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
