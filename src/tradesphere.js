import { createSystem, PanelUI, PanelDocument, eq } from '@iwsdk/core';

const STOCK_IDS = ['aapl', 'googl', 'msft', 'tsla'];

export class TradeSphereSystem extends createSystem({
  leftPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/left-panel.json')]
  },
  centerPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/center-panel.json')]
  },
  rightPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', './ui/right-panel.json')]
  }
}) {
  init() {
    this.selectedStockId = 'aapl';
    this.voiceTimers = new Map();

    this.queries.leftPanel.subscribe('qualify', (entity) => {
      const doc = PanelDocument.data.document[entity.index];
      if (!doc) return;
      STOCK_IDS.forEach((id) => {
        const btn = doc.getElementById(`stock-${id}`);
        if (btn) btn.addEventListener('click', () => this.selectStock(id));
      });
      this.syncWatchlist(doc);
    });

    this.queries.rightPanel.subscribe('qualify', (entity) => {
      const doc = PanelDocument.data.document[entity.index];
      if (!doc) return;
      const btn = doc.getElementById('voice-btn');
      if (btn) btn.addEventListener('click', () => this.handleVoice(doc));
    });

    this.queries.centerPanel.subscribe('qualify', (entity) => {
      const doc = PanelDocument.data.document[entity.index];
      if (!doc) return;
      this.renderCenterPanel(doc, this.getStockData(this.selectedStockId));
    });

    this.selectStock(this.selectedStockId);
  }

  selectStock(id) {
    const data = this.getStockData(id);
    if (!data) return;

    this.selectedStockId = id;

    this.queries.leftPanel.entities.forEach(entity => {
      const doc = PanelDocument.data.document[entity.index];
      if (doc) this.syncWatchlist(doc);
    });

    this.queries.centerPanel.entities.forEach(entity => {
      const doc = PanelDocument.data.document[entity.index];
      if (doc) this.renderCenterPanel(doc, data);
    });

    this.queries.rightPanel.entities.forEach(entity => {
      const doc = PanelDocument.data.document[entity.index];
      if (doc) this.renderRightPanel(doc, data);
    });
  }

  handleVoice(doc) {
    const data = this.getStockData(this.selectedStockId);
    if (!data) return;

    const existingTimer = this.voiceTimers.get(doc);
    if (existingTimer) clearTimeout(existingTimer);

    const prompt = doc.getElementById('chat-prompt');
    const chatText = doc.getElementById('chat-response');
    prompt.setProperties({ text: `Prompt: "${data.voicePrompt}"` });
    chatText.setProperties({ text: `Listening for ${data.ticker} voice command...` });

    const timer = setTimeout(() => {
      chatText.setProperties({ text: `AI: ${data.voiceResponse}` });
      this.voiceTimers.delete(doc);
    }, 1500);
    this.voiceTimers.set(doc, timer);
  }

  getStockData(id) {
    const db = {
      aapl: {
        ticker: 'AAPL',
        buttonLabel: 'AAPL  Apple Inc.  $189.45  +1.25%',
        name: 'Apple Inc.',
        price: '$189.45',
        change: '+1.25%',
        color: '#63d28f',
        trendLabel: 'Bullish Intraday',
        range: 'Range 186.90 - 191.10',
        volume: 'Vol 68.4M',
        signal: 'Momentum Breakout',
        bias: 'Accumulation',
        risk: 'Medium',
        insight: 'Apple is holding above short-term support while buyers keep stepping in on dips.',
        rec: 'BUY',
        confidence: 'Confidence 78%',
        insightPoints: 'AI demand narrative and stable services revenue keep the demo thesis constructive.',
        marketStatus: 'US Tech Leaders mixed, AI names outperforming.',
        voicePrompt: 'Should I buy this breakout?',
        voiceResponse: 'Momentum is positive, but waiting for confirmation above 190 can reduce chase risk.',
        candles: [
          { label: '09:30', wickHeight: 74, bodyHeight: 24, color: '#63d28f' },
          { label: '10:00', wickHeight: 86, bodyHeight: 30, color: '#63d28f' },
          { label: '10:30', wickHeight: 70, bodyHeight: 20, color: '#4bb7ff' },
          { label: '11:00', wickHeight: 92, bodyHeight: 36, color: '#63d28f' },
          { label: '11:30', wickHeight: 98, bodyHeight: 40, color: '#63d28f' },
          { label: '12:00', wickHeight: 84, bodyHeight: 22, color: '#4bb7ff' },
          { label: '12:30', wickHeight: 108, bodyHeight: 44, color: '#63d28f' },
          { label: '13:00', wickHeight: 116, bodyHeight: 48, color: '#63d28f' }
        ]
      },
      googl: {
        ticker: 'GOOGL',
        buttonLabel: 'GOOGL  Alphabet  $142.80  -0.45%',
        name: 'Alphabet Inc.',
        price: '$142.80',
        change: '-0.45%',
        color: '#ff7c70',
        trendLabel: 'Range Bound',
        range: 'Range 141.90 - 144.20',
        volume: 'Vol 31.2M',
        signal: 'Compression',
        bias: 'Neutral',
        risk: 'Low',
        insight: 'Alphabet is consolidating as traders weigh ad revenue softness against AI platform upside.',
        rec: 'HOLD',
        confidence: 'Confidence 64%',
        insightPoints: 'The demo setup shows indecision: buyers defend support, but upside conviction is limited.',
        marketStatus: 'Search and cloud names trading inside a tighter range.',
        voicePrompt: 'Is this a hold or a trim?',
        voiceResponse: 'The chart is neutral. Holding while waiting for a break above resistance fits this setup.',
        candles: [
          { label: '09:30', wickHeight: 88, bodyHeight: 34, color: '#ff7c70' },
          { label: '10:00', wickHeight: 72, bodyHeight: 22, color: '#4bb7ff' },
          { label: '10:30', wickHeight: 80, bodyHeight: 26, color: '#ff7c70' },
          { label: '11:00', wickHeight: 66, bodyHeight: 18, color: '#4bb7ff' },
          { label: '11:30', wickHeight: 76, bodyHeight: 20, color: '#ff7c70' },
          { label: '12:00', wickHeight: 70, bodyHeight: 18, color: '#4bb7ff' },
          { label: '12:30', wickHeight: 68, bodyHeight: 16, color: '#4bb7ff' },
          { label: '13:00', wickHeight: 74, bodyHeight: 22, color: '#ff7c70' }
        ]
      },
      msft: {
        ticker: 'MSFT',
        buttonLabel: 'MSFT  Microsoft  $402.10  +2.10%',
        name: 'Microsoft Corp.',
        price: '$402.10',
        change: '+2.10%',
        color: '#63d28f',
        trendLabel: 'Strong Uptrend',
        range: 'Range 395.40 - 404.80',
        volume: 'Vol 42.7M',
        signal: 'Trend Continuation',
        bias: 'Institutional Buy',
        risk: 'Medium',
        insight: 'Microsoft shows the strongest trend in the basket with sustained AI-driven buying interest.',
        rec: 'STRONG BUY',
        confidence: 'Confidence 84%',
        insightPoints: 'Cloud resilience plus AI platform leadership make this the highest-conviction demo name.',
        marketStatus: 'Large-cap AI leaders are extending highs into the afternoon.',
        voicePrompt: 'Can this trend keep running?',
        voiceResponse: 'Trend strength remains intact. Pullback entries near support may be cleaner than chasing highs.',
        candles: [
          { label: '09:30', wickHeight: 68, bodyHeight: 20, color: '#63d28f' },
          { label: '10:00', wickHeight: 82, bodyHeight: 28, color: '#63d28f' },
          { label: '10:30', wickHeight: 90, bodyHeight: 34, color: '#63d28f' },
          { label: '11:00', wickHeight: 102, bodyHeight: 40, color: '#63d28f' },
          { label: '11:30', wickHeight: 96, bodyHeight: 26, color: '#4bb7ff' },
          { label: '12:00', wickHeight: 110, bodyHeight: 42, color: '#63d28f' },
          { label: '12:30', wickHeight: 118, bodyHeight: 46, color: '#63d28f' },
          { label: '13:00', wickHeight: 126, bodyHeight: 54, color: '#63d28f' }
        ]
      },
      tsla: {
        ticker: 'TSLA',
        buttonLabel: 'TSLA  Tesla Inc.  $175.30  -1.80%',
        name: 'Tesla Inc.',
        price: '$175.30',
        change: '-1.80%',
        color: '#ff7c70',
        trendLabel: 'Bearish Pressure',
        range: 'Range 173.20 - 179.60',
        volume: 'Vol 96.1M',
        signal: 'Failed Bounce',
        bias: 'Distribution',
        risk: 'High',
        insight: 'Tesla remains volatile as sellers fade rebounds and traders focus on margin concerns.',
        rec: 'SELL',
        confidence: 'Confidence 71%',
        insightPoints: 'The demo signal shows weak follow-through and elevated downside risk if support breaks.',
        marketStatus: 'High-beta EV names are lagging the broader tech tape.',
        voicePrompt: 'Should I cut this position?',
        voiceResponse: 'Risk remains elevated. Reducing size until momentum improves would match this bearish setup.',
        candles: [
          { label: '09:30', wickHeight: 112, bodyHeight: 42, color: '#ff7c70' },
          { label: '10:00', wickHeight: 96, bodyHeight: 28, color: '#4bb7ff' },
          { label: '10:30', wickHeight: 106, bodyHeight: 36, color: '#ff7c70' },
          { label: '11:00', wickHeight: 88, bodyHeight: 22, color: '#4bb7ff' },
          { label: '11:30', wickHeight: 100, bodyHeight: 34, color: '#ff7c70' },
          { label: '12:00', wickHeight: 84, bodyHeight: 20, color: '#4bb7ff' },
          { label: '12:30', wickHeight: 92, bodyHeight: 30, color: '#ff7c70' },
          { label: '13:00', wickHeight: 78, bodyHeight: 18, color: '#4bb7ff' }
        ]
      }
    };
    return db[id];
  }

  syncWatchlist(doc) {
    STOCK_IDS.forEach((stockId) => {
      const btn = doc.getElementById(`stock-${stockId}`);
      const data = this.getStockData(stockId);
      if (!btn || !data) return;

      const isSelected = stockId === this.selectedStockId;
      btn.setProperties({
        text: data.buttonLabel,
        backgroundColor: isSelected ? 'rgba(52, 126, 220, 0.96)' : 'rgba(18, 46, 89, 0.95)',
        borderColor: isSelected ? 'rgba(181, 224, 255, 0.36)' : 'rgba(123, 190, 255, 0.22)',
        color: '#f3fbff'
      });
    });

    const activeData = this.getStockData(this.selectedStockId);
    const marketStatus = doc.getElementById('market-status');
    if (activeData && marketStatus) {
      marketStatus.setProperties({ text: activeData.marketStatus });
    }
  }

  renderCenterPanel(doc, data) {
    doc.getElementById('stock-title').setProperties({ text: data.name });
    doc.getElementById('trend-label').setProperties({ text: data.trendLabel });
    doc.getElementById('price').setProperties({ text: data.price });
    doc.getElementById('change').setProperties({ text: data.change, color: data.color });
    doc.getElementById('range').setProperties({ text: data.range });
    doc.getElementById('volume').setProperties({ text: data.volume });
    doc.getElementById('signal').setProperties({ text: data.signal });
    doc.getElementById('bias').setProperties({ text: data.bias });
    doc.getElementById('risk').setProperties({ text: data.risk });

    data.candles.forEach((candle, index) => {
      const wick = doc.getElementById(`wick-${index}`);
      const body = doc.getElementById(`body-${index}`);
      const label = doc.getElementById(`label-${index}`);
      if (wick) {
        wick.setProperties({
          height: candle.wickHeight,
          backgroundColor: candle.color
        });
      }
      if (body) {
        body.setProperties({
          height: candle.bodyHeight,
          backgroundColor: candle.color
        });
      }
      if (label) {
        label.setProperties({ text: candle.label });
      }
    });
  }

  renderRightPanel(doc, data) {
    doc.getElementById('insight-text').setProperties({ text: data.insight });
    doc.getElementById('rec-text').setProperties({ text: data.rec, color: data.color });
    doc.getElementById('confidence').setProperties({ text: data.confidence });
    doc.getElementById('insight-points').setProperties({ text: data.insightPoints });
    doc.getElementById('chat-prompt').setProperties({ text: `Prompt: "${data.voicePrompt}"` });
    doc.getElementById('chat-response').setProperties({ text: `AI: ${data.voiceResponse}` });
  }
}
