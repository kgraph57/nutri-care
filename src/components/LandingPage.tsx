import React from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  ExternalLink,
  Download,
  Globe,
  Images,
  KeyRound,
  Languages,
  LayoutGrid,
  ListChecks,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  currentTime: Date;
  setCurrentView: (view: string) => void;
}

const translationChips = ['やさしい解説', '急変時ガイド', 'チーム共有向け'];

const highlightCards = [
  {
    icon: <ShieldCheck size={18} />,
    title: 'ログイン不要ですぐに利用',
    description: '初回アクセスからそのまま入力可能。端末ローカルに保存し、医療施設のネットワーク制限にも対応します。',
    action: 'modern-dashboard',
  },
  {
    icon: <MessageCircle size={18} />,
    title: 'AIが解説も添付',
    description: 'Nani翻訳のUXを踏襲し、数値根拠と注意点を注釈付きで提示。スタッフ間の理解を揃えます。',
    action: 'nutrition-calc',
  },
  {
    icon: <Images size={18} />,
    title: '画像やPDFもドラッグで解析',
    description: '栄養計画書やラボ結果をアップロードして要点抽出。ショートカット一発で共有可能です。',
    action: 'patient-management',
  },
];

const infoTags = ['macOS / Windows / Web', '英語・日本語 UI', '院内プロキシ対応', '再学習には未使用'];

const downloadCards = [
  {
    title: 'デスクトップ版をダウンロード',
    description: 'ショートカットから瞬時に呼び出せるmacOS / Windowsアプリ。電子カルテと並行利用できます。',
    cta: 'アプリを入手',
    href: '#',
    badge: '推奨',
  },
  {
    title: 'Web版で試す',
    description: 'ブラウザだけで利用可能。ログイン不要で即スタートでき、保存データは端末内に保持します。',
    cta: 'ブラウザで開く',
    href: '#',
    badge: '無料',
  },
];

const languageItems = [
  { name: 'English', description: '医療英語にも対応し、和訳と注釈を瞬時に生成。' },
  { name: '日本語', description: '臨床記録に合わせた専門用語辞書を同梱。' },
  { name: 'Español', description: 'ラテンアメリカ圏スタッフとの連携に。' },
  { name: '한국어', description: 'Korean medical notes を円滑に共有。' },
  { name: '简体中文', description: '主要学会資料に合わせた翻訳ガイドラインを反映。' },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '無料',
    description: '小規模チームでまずは試用。',
    features: ['月30ケースまで保存', '画像解析は月10回まで', 'チーム共有 3ユーザー'],
    cta: '無料で始める',
  },
  {
    name: 'Pro',
    price: '¥4,800/月',
    description: 'ICU / PICUユニット向けの標準プラン。',
    features: ['無制限の栄養提案', 'リアルタイムコメント', '院内プロキシ対応', 'APIアクセス'],
    cta: '14日間トライアル',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'お問い合わせ',
    description: '大規模医療機関での導入に。',
    features: ['シングルサインオン', '専任サポート', 'カスタムモデル接続', '監査ログ出力'],
    cta: 'セールスに問い合わせ',
  },
];

const testimonialItems = [
  {
    quote:
      'ECMO患者の栄養記録を翻訳共有するのに、以前は数時間かかっていました。Nutrition Translateなら、Naniと同じUIで30秒です。',
    author: '東京大学医学部附属病院 ICU チーフ',
  },
  {
    quote: '夜間当直でもダッシュボードから状況が把握でき、チームでの意思決定が圧倒的に速くなりました。',
    author: '大阪市立総合医療センター 栄養サポートチーム',
  },
  {
    quote: 'ショートカット呼び出しとローカル保存。Naniの思想をそのまま医療現場に持ち込めています。',
    author: 'St. Luke’s International Hospital 栄養士',
  },
];

const updatePosts = [
  {
    title: 'ショートカットのカスタム登録に対応しました',
    description: 'ワンクリックでNani風の翻訳モーダルを呼び出し、院内マニュアルを展開できます。',
    href: '#',
  },
  {
    title: 'AIサマリーにICU栄養ガイドラインを反映',
    description: 'ESPEN / ASPENの最新推奨を自動で参照し、根拠リンクを添付するようになりました。',
    href: '#',
  },
  {
    title: '画像解析で手書きメモに対応',
    description: '紙カルテの写真をアップロードすると、そのまま翻訳と栄養計算が行えます。',
    href: '#',
  },
];

const faqItems = [
  {
    question: 'アカウント登録は必要ですか？',
    answer: '不要です。Naniと同じく、アプリを起動した瞬間から翻訳・栄養提案が利用できます。設定は端末ローカルに安全に保存されます。',
  },
  {
    question: 'データは学習に使われますか？',
    answer:
      '翻訳や栄養提案のデータは学習用途に再利用されません。Google / OpenAI / Groqのポリシーに従い短期間で破棄されます。',
  },
  {
    question: '対応OSを教えてください。',
    answer:
      'macOS (Apple Silicon / 14以降) と Windows (64bit) のデスクトップアプリを提供。ブラウザ版は最新のChrome / Edge / Safariを推奨しています。',
  },
  {
    question: '画像やPDFも解析できますか？',
    answer:
      'はい。ドラッグ＆ドロップで栄養投与計画書やラボ結果を取り込み、翻訳と同時に栄養評価のサマリーを生成します。',
  },
  {
    question: '医療機関での利用に制限はありますか？',
    answer:
      '院内プロキシや閉域網でも動作するよう設計されています。必要に応じてセキュリティチェックシートも提供可能です。',
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ currentTime, setCurrentView }) => {
  const handleScrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="landing-root">
      <div className="landing-banner">
        <span className="landing-banner-dot" />
        今なら医療機関向け早期導入プランを提供中。<button type="button">資料をダウンロード</button>
      </div>
      <header className="landing-header">
        <div className="landing-nav">
          <div className="landing-logo">
            <Sparkles size={20} color="#2563eb" />
            <span>Nutrition Translate</span>
          </div>

          <div className="landing-nav-links">
            <button type="button" onClick={() => handleScrollTo('features')}>
              これはなに？
            </button>
            <button type="button" onClick={() => handleScrollTo('workflow')}>
              使い方
            </button>
            <button type="button" onClick={() => handleScrollTo('security')}>
              セキュリティ
            </button>
            <button type="button" onClick={() => handleScrollTo('languages')}>
              対応言語
            </button>
            <button type="button" onClick={() => handleScrollTo('pricing')}>
              料金プラン
            </button>
            <button type="button" onClick={() => handleScrollTo('testimonials')}>
              導入事例
            </button>
            <button type="button" onClick={() => handleScrollTo('updates')}>
              更新情報
            </button>
            <button type="button" onClick={() => handleScrollTo('faq')}>
              FAQ
            </button>
            <button type="button" onClick={() => setCurrentView('food-database')}>
              栄養データベース
            </button>
          </div>

          <div className="landing-actions">
            <button type="button" className="landing-action-secondary" onClick={() => handleScrollTo('features')}>
              概要を見る
            </button>
            <button type="button" className="landing-action-primary" onClick={() => setCurrentView('modern-dashboard')}>
              無料で試す <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div>
            <div className="landing-hero-badge">
              <Languages size={14} />
              解説付きでバシッと栄養評価
            </div>
            <h1 className="landing-hero-title">翻訳アプリの体験で、栄養管理をもっと速く。</h1>
            <p className="landing-hero-description">
              Nani翻訳のUIUXをそのまま医療現場へ。入力 → AI解析 → 共有が一画面で完結し、チームの意思決定を加速します。
            </p>
            <div className="landing-hero-buttons">
              <button type="button" className="landing-action-primary" onClick={() => setCurrentView('patient-management')}>
                症例を登録する <ArrowRight size={16} />
              </button>
              <button type="button" className="landing-action-secondary" onClick={() => setCurrentView('nutrition-menus')}>
                保存メニューを見る
              </button>
              <button type="button" className="landing-action-secondary" onClick={() => setCurrentView('nutrition-calc')}>
                栄養計算に進む
              </button>
            </div>
            <div className="landing-hero-meta">
              <span>
                <Clock size={14} />
                {currentTime.toLocaleString('ja-JP')}
              </span>
              <span>
                <MessageCircle size={14} />
                コメント・メンション対応
              </span>
              <span>
                <Globe size={14} />
                日英同時翻訳で共有
              </span>
            </div>
          </div>

          <div className="landing-hero-panel">
            <div className="landing-panel-head">
              <div className="landing-panel-langs">
                <span>日本語</span>
                <ArrowRight size={14} />
                <span>Clinical Summary</span>
              </div>
              <div className="landing-panel-state">
                <Sparkles size={14} />
                リアルタイム解析中
              </div>
            </div>
            <div className="landing-panel-body">
              <div className="landing-panel-input">
                <span className="landing-panel-label">ICUノート</span>
                <p className="landing-panel-text">
                  敗血症管理中の患者。透析施行、経腸栄養1400kcal/日・たんぱく質60g/日。乳酸1.8mmol/Lで推移、K補正が必要。
                </p>
              </div>
              <div className="landing-panel-output">
                <span className="landing-panel-label">AIサマリー</span>
                <p className="landing-panel-text">
                  ・推奨エネルギー 1850kcal/日 (30kcal/kg)<br />
                  ・たんぱく質 1.3g/kg → 78g/日前後<br />
                  ・透析起因のK低下に備え 30mEq/日で補正
                </p>
                <div className="landing-panel-expressions">
                  {translationChips.map((chip) => (
                    <span key={chip} className="landing-panel-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="landing-panel-actions">
              <button type="button" className="landing-panel-button" onClick={() => setCurrentView('nutrition-calc')}>
                目標量を再計算
              </button>
              <button type="button" className="landing-panel-button" onClick={() => setCurrentView('nutrition-menus')}>
                メニューを保存
              </button>
              <button type="button" className="landing-panel-button" onClick={() => setCurrentView('food-database')}>
                成分を確認
              </button>
            </div>
          </div>
        </section>

        <section id="features" className="landing-feature-section">
          <div>
            <h2 className="landing-feature-title">ログインなしで、現場のスピードに即対応</h2>
            <p className="landing-feature-description">
              Nani翻訳が実現した「高速レスポンス」「解説付きの出力」「ローカル保存」を継承。ショートカット起動、即時共有、医療現場での制約対応まで同じUXで提供します。
            </p>
            <div className="landing-feature-badges">
              <span className="landing-feature-badge">
                <KeyRound size={14} />
                ログイン不要
              </span>
              <span className="landing-feature-badge">
                <Upload size={14} />
                端末保存のみ
              </span>
              <span className="landing-feature-badge">
                <BarChart3 size={14} />
                平均1.9秒レスポンス
              </span>
            </div>
          </div>

          <div className="landing-highlight-grid">
            {highlightCards.map((card) => (
              <article key={card.title} className="landing-highlight-card" onClick={() => setCurrentView(card.action)}>
                <div className="landing-highlight-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-download-section">
          <div className="landing-download-header">
            <h2>どの端末でも、同じ操作性で利用できます</h2>
            <p>
              Nani同様、デスクトップアプリとWeb版を用意。ショートカット操作・画像解析・ローカル保存に対応し、環境を問わず同じ体験を提供します。
            </p>
          </div>
          <div className="landing-download-grid">
            {downloadCards.map((card) => (
              <article key={card.title} className="landing-download-card">
                <div className="landing-download-badge">{card.badge}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <a href={card.href} className="landing-download-link">
                  <Download size={16} />
                  {card.cta}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="landing-pricing-section">
          <div className="landing-pricing-header">
            <h2>料金プラン</h2>
            <p>Naniの価格表と同じく、最初は無料で始められます。必要に応じてPro / Enterpriseへアップグレード。</p>
          </div>
          <div className="landing-pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`landing-pricing-card${plan.highlight ? ' is-highlight' : ''}`}>
                {plan.highlight && <span className="landing-pricing-badge">人気</span>}
                <h3>{plan.name}</h3>
                <span className="landing-pricing-price">{plan.price}</span>
                <p>{plan.description}</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Sparkles size={14} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button type="button" className="landing-pricing-cta">
                  {plan.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="testimonials" className="landing-testimonial-section">
          <div className="landing-testimonial-header">
            <h2>導入医療機関の声</h2>
            <p>Naniの「ユーザーの声」セクションに倣い、導入後の変化を紹介します。</p>
          </div>
          <div className="landing-testimonial-grid">
            {testimonialItems.map((item) => (
              <article key={item.author} className="landing-testimonial-card">
                <Rocket size={24} />
                <p>“{item.quote}”</p>
                <span>{item.author}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="updates" className="landing-updates-section">
          <div className="landing-updates-header">
            <h2>更新情報</h2>
            <p>NaniがブログやXで共有しているアップデートを模倣し、最新機能をまとめています。</p>
          </div>
          <div className="landing-updates-grid">
            {updatePosts.map((post) => (
              <article key={post.title} className="landing-updates-card">
                <LayoutGrid size={20} />
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <a href={post.href}>
                  詳細を読む <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="landing-info-section">
          <div className="landing-info-card">
            <h2>入力 → AI解析 → 共有の3ステップ</h2>
            <p>
              Naniの翻訳ワークフローを模倣し、医療栄養でも迷いなく使える導線を整えました。ショートカットで呼び出し、その場でサマリー作成・共有が可能です。
            </p>
            <div className="landing-info-list">
              <span className="landing-info-item">
                <ListChecks size={16} />
                任意のアプリからショートカットでノートを投入
              </span>
              <span className="landing-info-item">
                <BookOpen size={16} />
                根拠となる数式やガイドラインを自動で添付
              </span>
              <span className="landing-info-item">
                <MessageCircle size={16} />
                コメントとメンションでスタッフ間の連携を強化
              </span>
            </div>
            <div className="landing-info-meta">
              <div className="landing-info-box">
                <span>1.9秒</span>
                <p className="landing-info-caption">初期レスポンス平均</p>
              </div>
              <div className="landing-info-box">
                <span>∞</span>
                <p className="landing-info-caption">保存できる症例メモ</p>
              </div>
            </div>
          </div>
          
          <div className="landing-info-panel">
            <h3>Nani翻訳の技術的知見をそのまま活用</h3>
            <p>
              Turso + Upstashを用いた低遅延キャッシュ、Next.jsとElectronを共通化するモノレポ構成など、Zenn記事
              <a href="https://zenn.dev/catnose99/articles/nani-translate" target="_blank" rel="noreferrer">
                「Nani翻訳の技術的な話」
              </a>
              で紹介された設計を参考にしています。
            </p>
            <p>
              macOS / Windowsアプリではショートカット起動、Web版ではブラウザのみで体験可能。翻訳データと同様に栄養提案も端末側に保存され、サーバーには残りません。
            </p>
            <div className="landing-info-tags">
              {infoTags.map((tag) => (
                <span key={tag} className="landing-info-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="landing-info-section">
          <div className="landing-info-panel">
            <h3>セキュリティとプライバシー</h3>
            <p>
              入力データは端末上に安全に保存され、運営スタッフが閲覧することはありません。処理のために送信された情報はGoogle / OpenAI / Groqで短期間のみ保持され、自動削除されます。
              翻訳データは機械学習の再学習には利用しません。
            </p>
            <div className="landing-info-tags">
              <span className="landing-info-tag">端末ローカル保存</span>
              <span className="landing-info-tag">再学習には未使用</span>
              <span className="landing-info-tag">二次利用なし</span>
              <span className="landing-info-tag">セキュリティシート対応</span>
            </div>
          </div>
          <div className="landing-info-panel">
            <h3>対応環境</h3>
            <p>
              Web版はブラウザだけで利用可能。macOS (Apple Silicon / macOS 14+) とWindowsアプリでは、他アプリからのショートカット翻訳、画像やPDFのドラッグ＆ドロップ解析にも対応しています。
            </p>
            <div className="landing-info-tags">
              <span className="landing-info-tag">macOS / Windowsアプリ</span>
              <span className="landing-info-tag">ブラウザ版</span>
              <span className="landing-info-tag">画像・PDF解析</span>
              <span className="landing-info-tag">オフライン閲覧</span>
            </div>
          </div>
        </section>

        <section id="languages" className="landing-languages-section">
          <div className="landing-languages-header">
            <h2>対応言語</h2>
            <p>チーム構成に合わせて柔軟に拡張中。翻訳と同時に栄養評価サマリーを生成します。</p>
          </div>
          <div className="landing-languages-grid">
            {languageItems.map((item) => (
              <article key={item.name} className="landing-language-card">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
          <a href="#" className="landing-languages-link">
            <ExternalLink size={16} />
            対応予定の言語を確認する
          </a>
        </section>

        <section id="faq" className="landing-faq-section">
          <div className="landing-faq-header">
            <h2>よくある質問</h2>
            <p>NaniのFAQと同じく、導入前によくいただく質問をまとめました。</p>
          </div>
          <div className="landing-faq-grid">
            {faqItems.map((faq) => (
              <details key={faq.question} className="landing-faq-item">
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
        </div>
        </section>

        <section className="landing-info-section">
          <div className="landing-info-card">
            <h2>Naniと同じ操作感で、医療現場の安心を。</h2>
            <p>
              翻訳アプリで培われた「迷いのない導線」「瞬時のレスポンス」「温度感のある説明」を、栄養管理ワークフローに落とし込みました。入力が苦手なスタッフでも直感的に扱えます。
            </p>
            <div className="landing-info-list">
              <span className="landing-info-item">
                <Activity size={16} />
                入力から共有まで2クリック以内
              </span>
              <span className="landing-info-item">
                <ShieldCheck size={16} />
                医療法規に配慮した保存ポリシー
              </span>
              <span className="landing-info-item">
                <Globe size={16} />
                日本語・英語を自動で整形
              </span>
            </div>
        </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>© 2025 Nutrition Translate. All rights reserved.</span>
        <div className="landing-footer-links">
          <a href="https://nani.now/ja" target="_blank" rel="noreferrer">
            Nani公式サイト
          </a>
          <a href="https://zenn.dev/catnose99/articles/nani-translate" target="_blank" rel="noreferrer">
            技術リファレンス
          </a>
          <a href="mailto:hello@icu-nutrition-app.example">お問い合わせ</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
