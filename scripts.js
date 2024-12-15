// ダークモードとライトモードの切り替え
document.getElementById('themeToggle').addEventListener('click', function() {
    const body = document.body;
    const textArea = document.getElementById('textInput');
    const buttons = document.querySelectorAll('button');
    const result = document.getElementById('result');
    const spinner = document.getElementById('spinner');
    const toggleButton = document.getElementById('themeToggle');



    // ダークモードの切り替え
    body.classList.toggle('dark-mode');
    textArea.classList.toggle('dark-mode');
    result.classList.toggle('dark-mode');
    buttons.forEach(button => button.classList.toggle('dark-mode'));
    spinner.classList.toggle('dark-mode');

    // ボタンの表示切り替え
    if (body.classList.contains('dark-mode')) {
        toggleButton.textContent = 'ライトモード';
    } else {
        toggleButton.textContent = 'ダークモード';
    }

    // aria-pressed の更新
    const isDarkMode = body.classList.contains('dark-mode');
    toggleButton.setAttribute('aria-pressed', isDarkMode);
});

// ユーザーのシステム設定に基づく初期モード設定
window.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        document.getElementById('textInput').classList.add('dark-mode');
        document.getElementById('result').classList.add('dark-mode');
        document.querySelectorAll('button').forEach(button => button.classList.add('dark-mode'));
        document.getElementById('spinner').classList.add('dark-mode');
        document.getElementById('themeToggle').textContent = 'ライトモード';
        document.getElementById('themeToggle').setAttribute('aria-pressed', 'true');
    }
});

// 判定の処理
function detectAI(text) {
    // 日本語判定
    if (!/[\u3040-\u30FF\u4E00-\u9FFF\u3000-\u303F]/.test(text)) {
        return "日本語以外の言語が含まれています。日本語の文章を入力してください。";
    }

    // キーワードリスト
    const keywords = [
        "特に", "さらに", "示唆", "象徴的", "悔い改め", "欲望", "赦し", "哲学", 
        "重要性", "抽象", "倫理", "可能性", "考察", "深層", "展開", "根底", "検討",
        "合理的", "精緻", "理論的", "視点", "観点", "思考", "分析", "解釈", "前提", "反論", 
        "支配的", "結論", "有意義", "普遍的", "導出", "概念", "本質", "証拠", "知識", 
        "計算", "相対的", "確率", "妥当性", "整合性", "最適", "推論", "仮説", "実証", "評価", 
        "探索的", "予測", "反証", "統率力", "忠誠", "謙虚"
    ];

    // 接続詞リスト
    const connectors = [
        "また", "さらに", "例えば", "したがって", "このように", "そのため", 
        "一方", "つまり", "その結果", "それゆえ", "従って", "このため", 
        "一方で", "結局", "要するに", "その上", "すなわち", "同様に", "そのために", "だが", 
        "言い換えれば", "そうすると", "そうでない場合", "このようにして", "それに加えて", 
        "その他にも", "一方では"
    ];

    // AIフレーズリスト
    const aiPhrases = [
        "言及されている", "示されている", "反映される", "強調される", 
        "言及すべき", "考慮する", "取り上げるべき", "結論として", 
        "言葉では表現しきれない", "結局のところ", "最終的に", "論じるべき", 
        "その通り", "理解すべき", "注意すべき", "一方で", "検討すべき", "結論としていえる", 
        "取り上げるべき", "注目すべき", "これらの点において", "考えられる", "推測される", 
        "推定される", "想定される", "正当化する", "評価する", "議論すべき", "この観点から", 
        "この結果", "調査する", "強調する", "進めるべき", "慎重に考慮する", "最適な"
    ];

    // 初期スコア
    let score = 0;
    let scoreExplanation = [];

    // カウント変数
    let keywordCount = 0;
    let connectorCount = 0;
    let aiPhraseCount = 0;

    // キーワードスコア
    keywords.forEach(keyword => {
        const count = (text.match(new RegExp(keyword, "g")) || []).length;
        keywordCount += count;
        score += count * 3; // キーワード1つにつき3点
    });

    // 接続詞スコア
    connectors.forEach(connector => {
        // 正規表現の修正：全角括弧を半角に変更
        const count = (text.match(new RegExp(`(?:${connector})`, "g")) || []).length;
        connectorCount += count;
        score += count * 1.5; // 接続詞1つにつき1.5点
    });

    // AIフレーズスコア
    aiPhrases.forEach(phrase => {
        const count = (text.match(new RegExp(phrase, "g")) || []).length;
        aiPhraseCount += count;
        score += count * 3; // AIフレーズ1つにつき3点
    });

    // 文の平均長スコア
    const sentences = text.split(/[。！？\n]/).filter(Boolean); // 文のリスト
    const averageLength = sentences.reduce((sum, sentence) => sum + sentence.length, 0) / sentences.length;
    if (averageLength > 25) {
        score += 8; // 平均長25文字以上なら8点
    }

    // 長文スコア
    const longSentences = sentences.filter(sentence => sentence.length > 70).length;
    if (longSentences > 4) {
        score += 8; // 長文が4つ以上なら8点
    }

    // 感情的な表現スコア
    const emotionalWords = ["愛", "友情", "喜び", "悲しみ", "感謝", "希望", "情熱", "思いやり"];
    const emotionalCount = emotionalWords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
    if (emotionalCount === 0) {
        score += 8; // 感情表現が少ない場合、8点
    }

    // 常体の検出
    const isInformal = /だ|である/.test(text); // 'だ' または 'である' が含まれているか
    if (isInformal) {
        score -= 4; // 常体の場合、4点減点
    }

    // 判定結果
    let resultText = '';
    if (score > 38) {
        resultText = `AIを使った可能性が高い（スコア: ${score}）`;
    } else if (score >= 25) {
        resultText = `一部AIを使った可能性がある（スコア: ${score}）`;
    } else {
        resultText = `人間が書いた可能性が高い（スコア: ${score}）`;
    }

    // 影響の大きい要素の特定
    let highestImpact = { type: "", value: 0, explanation: "" };
    if (keywordCount > highestImpact.value) {
        highestImpact = { type: "キーワード", value: keywordCount, explanation: `キーワード数: ${keywordCount} 回` };
    }
    if (connectorCount > highestImpact.value) {
        highestImpact = { type: "接続詞", value: connectorCount, explanation: `接続詞数: ${connectorCount} 回` };
    }
    if (aiPhraseCount > highestImpact.value) {
        highestImpact = { type: "AIフレーズ", value: aiPhraseCount, explanation: `AIフレーズ数: ${aiPhraseCount} 回` };
    }

    // 改善メッセージ
    let improvementMessage = "";
    if (highestImpact.type === "キーワード") {
        const usedKeyword = keywords.find(k => text.includes(k)) || "該当するキーワード";
        improvementMessage = `キーワード「${usedKeyword}」が多く使われています。より自然な表現に改善してみてください。`;
    } else if (highestImpact.type === "接続詞") {
        const usedConnector = connectors.find(c => text.includes(c)) || "該当する接続詞";
        improvementMessage = `接続詞「${usedConnector}」が多く使われています。接続詞を減らし、シンプルな文章を心掛けてみてください。`;
    } else if (highestImpact.type === "AIフレーズ") {
        const usedAIPhrase = aiPhrases.find(p => text.includes(p)) || "該当するAIフレーズ";
        improvementMessage = `AIフレーズ「${usedAIPhrase}」が多く使われています。もっと個性的な表現を心掛けてみてください。`;
    }

    // 詳細な解析
    let detailedExplanation = `
        <h3>解析詳細:</h3>
        <ul>
            <li>キーワード数: ${keywordCount} 回</li>
            <li>接続詞数: ${connectorCount} 回</li>
            <li>AIフレーズ数: ${aiPhraseCount} 回</li>
            <li>平均文長: ${averageLength.toFixed(2)} 文字</li>
            <li>長文の数: ${longSentences} 件</li>
            <li>感情表現の数: ${emotionalCount} 回</li>
        </ul>
        <p>${improvementMessage}</p>
    `;

    // 結果の構築
    return `${resultText}<br>${detailedExplanation}`;
}

// 結果の視覚化
function displayChart(data) {
    const ctx = document.getElementById('resultChart').getContext('2d');
    // 既存のチャートがある場合は破壊して再描画
    if (window.resultChartInstance) {
        window.resultChartInstance.destroy();
    }
    window.resultChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['キーワード', '接続詞', 'AIフレーズ'],
            datasets: [{
                label: '出現回数',
                data: [data.keywords, data.connectors, data.aiPhrases],
                backgroundColor: ['#4CAF50', '#FF9800', '#2196F3']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// ボタンがクリックされたときの処理
document.getElementById('submitButton').addEventListener('click', function() {
    const spinner = document.getElementById('spinner');
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const result = document.getElementById('result');
    const text = textInput.value.trim();

    // 入力が空の場合、処理を中断
    if (text === "") {
        result.innerHTML = "入力が空です。文章を入力してください。";
        return;
    }

    // 文字数を表示
    charCount.textContent = `文字数: ${text.length}`;

    // 判定中のメッセージとスピナーの表示
    result.innerHTML = "判定中...";
    spinner.style.display = 'block';

    // 判定処理を非同期で実行
    setTimeout(() => {
        const analysisResult = detectAI(text);
        result.innerHTML = analysisResult;

        


        // スピナーの非表示
        spinner.style.display = 'none';
    }, 1000); // 模擬的な遅延時間
});

// リアルタイムで文字数をカウント
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');

textInput.addEventListener('input', () => {
    charCount.textContent = `文字数: ${textInput.value.length}`;
});

// コピーボタンの処理（最新のAPIを使用）
document.getElementById('copyButton').addEventListener('click', function() {
    const text = document.getElementById('textInput').value;
    if (!navigator.clipboard) {
        // 古いブラウザ向けのフォールバック
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('コピーしました！');
        } catch (err) {
            alert('コピーに失敗しました。');
            console.error('コピーエラー:', err);
        }
        document.body.removeChild(textArea);
        return;
    }
    navigator.clipboard.writeText(text)
        .then(() => {
            ;
        })
        .catch(err => {
            alert('コピーに失敗しました。');
            console.error('コピーエラー:', err);
        });
});

// 全消去ボタンの処理
document.getElementById('clearButton').addEventListener('click', function() {
    const textInput = document.getElementById('textInput');
    textInput.value = "";
    document.getElementById('charCount').textContent = "文字数: 0";
    document.getElementById('result').innerHTML = "結果がここに表示されます";
    // チャートもクリア
    if (window.resultChartInstance) {
        window.resultChartInstance.destroy();
    }
});



