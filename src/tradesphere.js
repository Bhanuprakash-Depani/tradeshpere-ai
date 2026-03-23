import { createSystem, createComponent, PanelUI, PanelDocument, eq, AssetManager } from '@iwsdk/core';

const STOCK_IDS = ['aapl', 'googl', 'msft', 'tsla'];
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const LIVE_QUOTE_REFRESH_MS = 5 * 60 * 1000;

const STOCK_BLUEPRINT = {
  aapl: {
    ticker: 'AAPL',
    company: 'Apple Inc.',
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
      { label: '09:30', open: 187.2, high: 188.4, low: 186.9, close: 188.1 },
      { label: '10:00', open: 188.1, high: 189.2, low: 187.7, close: 188.9 },
      { label: '10:30', open: 188.9, high: 189.4, low: 188.2, close: 188.5 },
      { label: '11:00', open: 188.5, high: 190.1, low: 188.3, close: 189.8 },
      { label: '11:30', open: 189.8, high: 190.5, low: 189.1, close: 189.4 },
      { label: '12:00', open: 189.4, high: 190.8, low: 189.0, close: 190.3 },
      { label: '12:30', open: 190.3, high: 191.0, low: 189.9, close: 190.8 },
      { label: '13:00', open: 190.8, high: 191.1, low: 190.2, close: 190.9 },
      { label: '13:30', open: 190.9, high: 191.3, low: 190.4, close: 191.1 },
      { label: '14:00', open: 191.1, high: 191.4, low: 190.6, close: 190.7 },
      { label: '14:30', open: 190.7, high: 191.2, low: 190.3, close: 191.0 },
      { label: '15:00', open: 191.0, high: 191.5, low: 190.8, close: 191.3 }
    ]
  },
  googl: {
    ticker: 'GOOGL',
    company: 'Alphabet',
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
      { label: '09:30', open: 143.8, high: 144.2, low: 142.6, close: 143.0 },
      { label: '10:00', open: 143.0, high: 143.4, low: 142.3, close: 142.7 },
      { label: '10:30', open: 142.7, high: 143.1, low: 142.2, close: 142.9 },
      { label: '11:00', open: 142.9, high: 143.0, low: 142.1, close: 142.4 },
      { label: '11:30', open: 142.4, high: 142.8, low: 141.9, close: 142.2 },
      { label: '12:00', open: 142.2, high: 142.7, low: 141.9, close: 142.5 },
      { label: '12:30', open: 142.5, high: 142.9, low: 142.0, close: 142.3 },
      { label: '13:00', open: 142.3, high: 142.8, low: 141.9, close: 142.1 },
      { label: '13:30', open: 142.1, high: 142.4, low: 141.8, close: 142.0 },
      { label: '14:00', open: 142.0, high: 142.3, low: 141.7, close: 141.8 },
      { label: '14:30', open: 141.8, high: 142.2, low: 141.6, close: 142.0 },
      { label: '15:00', open: 142.0, high: 142.5, low: 141.8, close: 142.2 }
    ]
  },
  msft: {
    ticker: 'MSFT',
    company: 'Microsoft',
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
      { label: '09:30', open: 397.1, high: 398.4, low: 396.2, close: 397.9 },
      { label: '10:00', open: 397.9, high: 399.6, low: 397.4, close: 399.2 },
      { label: '10:30', open: 399.2, high: 400.5, low: 398.7, close: 400.1 },
      { label: '11:00', open: 400.1, high: 401.8, low: 399.4, close: 401.4 },
      { label: '11:30', open: 401.4, high: 402.0, low: 400.6, close: 401.0 },
      { label: '12:00', open: 401.0, high: 403.1, low: 400.9, close: 402.4 },
      { label: '12:30', open: 402.4, high: 404.1, low: 401.8, close: 403.6 },
      { label: '13:00', open: 403.6, high: 404.8, low: 402.9, close: 404.2 },
      { label: '13:30', open: 404.2, high: 405.2, low: 403.8, close: 404.9 },
      { label: '14:00', open: 404.9, high: 405.6, low: 404.1, close: 404.4 },
      { label: '14:30', open: 404.4, high: 406.0, low: 404.0, close: 405.7 },
      { label: '15:00', open: 405.7, high: 406.4, low: 405.1, close: 406.1 }
    ]
  },
  tsla: {
    ticker: 'TSLA',
    company: 'Tesla Inc.',
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
      { label: '09:30', open: 178.9, high: 179.6, low: 177.4, close: 177.9 },
      { label: '10:00', open: 177.9, high: 178.3, low: 176.9, close: 177.2 },
      { label: '10:30', open: 177.2, high: 177.8, low: 176.1, close: 176.5 },
      { label: '11:00', open: 176.5, high: 177.1, low: 175.7, close: 176.0 },
      { label: '11:30', open: 176.0, high: 176.6, low: 174.8, close: 175.2 },
      { label: '12:00', open: 175.2, high: 176.0, low: 174.1, close: 174.7 },
      { label: '12:30', open: 174.7, high: 175.4, low: 173.8, close: 174.2 },
      { label: '13:00', open: 174.2, high: 175.0, low: 173.2, close: 173.8 },
      { label: '13:30', open: 173.8, high: 174.4, low: 173.0, close: 173.4 },
      { label: '14:00', open: 173.4, high: 174.1, low: 172.8, close: 173.1 },
      { label: '14:30', open: 173.1, high: 173.8, low: 172.4, close: 172.9 },
      { label: '15:00', open: 172.9, high: 173.5, low: 172.2, close: 172.6 }
    ]
  }
};

export const TrendMascot = createComponent('TrendMascot');

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
  },
  mascot: {
    required: [TrendMascot]
  }
}) {
  init() {
    this.selectedStockId = 'aapl';
    this.voiceTimers = new Map();
    this.tradeIntent = null;
    this.stockData = structuredClone(STOCK_BLUEPRINT);
    this.liveQuoteTimer = null;

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
      const buyBtn = doc.getElementById('buy-btn');
      const sellBtn = doc.getElementById('sell-btn');
      if (buyBtn) buyBtn.addEventListener('click', () => this.handleTradeAction('BUY'));
      if (sellBtn) sellBtn.addEventListener('click', () => this.handleTradeAction('SELL'));
      this.renderCenterPanel(doc, this.getStockData(this.selectedStockId));
    });

    this.selectStock(this.selectedStockId);
    this.startLiveQuotes();
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
    
    this.updateMascot(data);
  }

  updateMascot(data) {
    this.queries.mascot.entities.forEach(entity => {
      // Clear previous
      while(entity.object3D.children.length > 0){ 
        entity.object3D.remove(entity.object3D.children[0]); 
      }

      // Determine model based on rec/trend
      let assetId = null;
      if (data.rec.includes('BUY')) assetId = 'bull';
      else if (data.rec.includes('SELL')) assetId = 'bear';

      if (assetId) {
        const asset = AssetManager.getGLTF(assetId);
        if (asset) {
            const model = asset.scene.clone();
            entity.object3D.add(model);
        }
      }
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

  handleTradeAction(intent) {
    this.tradeIntent = intent;
    const data = this.getStockData(this.selectedStockId);
    if (!data) return;

    this.queries.centerPanel.entities.forEach((entity) => {
      const doc = PanelDocument.data.document[entity.index];
      if (doc) this.renderCenterPanel(doc, data);
    });
  }

  getStockData(id) {
    return this.stockData[id];
  }

  syncWatchlist(doc) {
    STOCK_IDS.forEach((stockId) => {
      const btn = doc.getElementById(`stock-${stockId}`);
      const data = this.getStockData(stockId);
      if (!btn || !data) return;

      const isSelected = stockId === this.selectedStockId;
      btn.setProperties({
        text: this.formatWatchlistLabel(data),
        backgroundColor: isSelected ? '#1b5cb2' : '#0e3363',
        borderColor: isSelected ? '#b6e0ff' : '#24548d',
        color: '#f3fbff'
      });
    });

    const activeData = this.getStockData(this.selectedStockId);
    const marketStatus = doc.getElementById('market-status');
    if (activeData && marketStatus) {
      const marketText = ALPHA_VANTAGE_API_KEY
        ? `${activeData.marketStatus} Live prices refresh every 5 minutes.`
        : `${activeData.marketStatus} Set VITE_ALPHA_VANTAGE_API_KEY for live prices.`;
      marketStatus.setProperties({ text: marketText });
    }
  }

  formatWatchlistLabel(data) {
    return `${data.ticker}  ${data.company}  ${data.price}  ${data.change}`;
  }

  startLiveQuotes() {
    if (!ALPHA_VANTAGE_API_KEY) {
      return;
    }

    this.refreshLiveQuotes();
    this.liveQuoteTimer = setInterval(() => {
      this.refreshLiveQuotes();
    }, LIVE_QUOTE_REFRESH_MS);
  }

  async refreshLiveQuotes() {
    const updates = await Promise.all(
      STOCK_IDS.map(async (stockId) => {
        const stock = this.getStockData(stockId);
        if (!stock) return null;

        try {
          const quote = await this.fetchIntradayQuote(stock.ticker);
          if (!quote) return null;
          return { stockId, quote };
        } catch (error) {
          console.error(`Failed to fetch live quote for ${stock.ticker}`, error);
          return null;
        }
      })
    );

    let didUpdate = false;

    updates.forEach((update) => {
      if (!update) return;
      const stock = this.getStockData(update.stockId);
      if (!stock) return;

      stock.price = update.quote.price;
      stock.change = update.quote.change;
      stock.color = update.quote.color;
      didUpdate = true;
    });

    if (didUpdate) {
      this.selectStock(this.selectedStockId);
    }
  }

  async fetchIntradayQuote(ticker) {
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', 'TIME_SERIES_INTRADAY');
    url.searchParams.set('symbol', ticker);
    url.searchParams.set('interval', '5min');
    url.searchParams.set('outputsize', 'compact');
    url.searchParams.set('extended_hours', 'false');
    url.searchParams.set('apikey', ALPHA_VANTAGE_API_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const series = payload['Time Series (5min)'];
    if (!series) {
      return null;
    }

    const entries = Object.entries(series).sort(([a], [b]) => b.localeCompare(a));
    const [latestEntry, previousEntry] = entries;
    if (!latestEntry || !previousEntry) {
      return null;
    }

    const latestClose = Number.parseFloat(latestEntry[1]['4. close']);
    const previousClose = Number.parseFloat(previousEntry[1]['4. close']);
    if (!Number.isFinite(latestClose) || !Number.isFinite(previousClose) || previousClose === 0) {
      return null;
    }

    const delta = latestClose - previousClose;
    const percent = (delta / previousClose) * 100;

    return {
      price: `$${latestClose.toFixed(2)}`,
      change: `${delta >= 0 ? '+' : ''}${percent.toFixed(2)}%`,
      color: delta >= 0 ? '#63d28f' : '#ff7c70'
    };
  }

  renderCenterPanel(doc, data) {
    const stockTitle = doc.getElementById('stock-title');
    if (stockTitle) {
      stockTitle.setProperties({ text: data.name });
    }

    const trendLabel = doc.getElementById('trend-label');
    if (trendLabel) {
      trendLabel.setProperties({ text: data.trendLabel });
    }

    const price = doc.getElementById('price');
    if (price) {
      price.setProperties({ text: data.price });
    }

    const change = doc.getElementById('change');
    if (change) {
      change.setProperties({ text: data.change, color: data.color });
    }

    const range = doc.getElementById('range');
    if (range) {
      range.setProperties({ text: data.range });
    }

    const volume = doc.getElementById('volume');
    if (volume) {
      volume.setProperties({ text: data.volume });
    }

    const chartFootnote = doc.getElementById('chart-footnote');
    if (chartFootnote) {
      chartFootnote.setProperties({ text: this.buildChartFootnote(data) });
    }

    const chartHigh = doc.getElementById('chart-high');
    if (chartHigh) {
      chartHigh.setProperties({ text: `High ${this.formatPrice(this.getPriceBounds(data.candles).high)}` });
    }

    const chartLow = doc.getElementById('chart-low');
    if (chartLow) {
      chartLow.setProperties({ text: `Low ${this.formatPrice(this.getPriceBounds(data.candles).low)}` });
    }

    const chartSignal = doc.getElementById('chart-signal');
    if (chartSignal) {
      chartSignal.setProperties({ text: this.buildChartSignal(data) });
    }

    const centerSignal = doc.getElementById('center-signal');
    if (centerSignal) {
      centerSignal.setProperties({ text: data.signal });
    }

    const bias = doc.getElementById('bias');
    if (bias) {
      bias.setProperties({ text: data.bias });
    }

    const risk = doc.getElementById('risk');
    if (risk) {
      risk.setProperties({ text: data.risk });
    }

    const tradeStatus = doc.getElementById('trade-status');
    if (tradeStatus) {
      tradeStatus.setProperties({ text: this.buildTradeStatus(data) });
    }

    const buyBtn = doc.getElementById('buy-btn');
    if (buyBtn) {
      buyBtn.setProperties({
        backgroundColor: this.tradeIntent === 'BUY' ? '#31a66d' : '#1f8b57',
        borderColor: this.tradeIntent === 'BUY' ? '#d9ffec' : '#a4d4ff'
      });
    }

    const sellBtn = doc.getElementById('sell-btn');
    if (sellBtn) {
      sellBtn.setProperties({
        backgroundColor: this.tradeIntent === 'SELL' ? '#d2565d' : '#b4454c',
        borderColor: this.tradeIntent === 'SELL' ? '#ffe0e2' : '#a4d4ff'
      });
    }

    const barLayout = this.buildBarLayout(data.candles);
    const priceBounds = this.getPriceBounds(data.candles);
    const axisTop = doc.getElementById('axis-top');
    const axisMid = doc.getElementById('axis-mid');
    const axisLow = doc.getElementById('axis-low');

    if (axisTop) {
      axisTop.setProperties({ text: this.formatPrice(priceBounds.high) });
    }
    if (axisMid) {
      axisMid.setProperties({ text: this.formatPrice((priceBounds.high + priceBounds.low) / 2) });
    }
    if (axisLow) {
      axisLow.setProperties({ text: this.formatPrice(priceBounds.low) });
    }

    data.candles.forEach((candle, index) => {
      const body = doc.getElementById(`body-${index}`);
      const label = doc.getElementById(`label-${index}`);
      const candleTop = doc.getElementById(`candle-top-${index}`);
      const candleBottom = doc.getElementById(`candle-bottom-${index}`);
      const bullish = candle.close >= candle.open;
      const barColor = bullish ? '#63d28f' : '#ff7c70';
      if (body) {
        body.setProperties({
          height: barLayout[index].bar,
          backgroundColor: barColor,
          borderColor: bullish ? 'rgba(255,255,255,0.12)' : '#ffb0aa',
          boxShadow: bullish ? '0 0 16px rgba(99, 210, 143, 0.18)' : '0 0 16px rgba(255, 124, 112, 0.16)'
        });
      }
      if (label) {
        label.setProperties({ text: candle.label });
      }
      if (candleTop) {
        candleTop.setProperties({ height: barLayout[index].top });
      }
      if (candleBottom) {
        candleBottom.setProperties({ height: barLayout[index].bottom });
      }
    });
  }

  buildChartFootnote(data) {
    if (data.change.startsWith('+')) {
      return `${data.ticker} is pushing higher with buyers staying in control.`;
    }
    if (data.change.startsWith('-')) {
      return `${data.ticker} is trading softer as momentum cools off.`;
    }
    return `${data.ticker} is holding steady through the current session.`;
  }

  buildChartSignal(data) {
    const first = data.candles[0];
    const last = data.candles[data.candles.length - 1];
    if (!first || !last) {
      return 'Sideways Session';
    }
    if (last.close > first.open) {
      return 'Bullish Session';
    }
    if (last.close < first.open) {
      return 'Bearish Session';
    }
    return 'Sideways Session';
  }

  buildTradeStatus(data) {
    if (this.tradeIntent === 'BUY') {
      return `Demo ticket ready: BUY ${data.ticker} near ${data.price} with ${data.bias.toLowerCase()} bias.`;
    }
    if (this.tradeIntent === 'SELL') {
      return `Demo ticket ready: SELL ${data.ticker} near ${data.price} while risk remains ${data.risk.toLowerCase()}.`;
    }
    return `Tap BUY or SELL to simulate a ${data.ticker} order ticket for this prototype.`;
  }

  buildBarLayout(candles) {
    const bounds = this.getPriceBounds(candles);
    const range = Math.max(0.01, bounds.high - bounds.low);
    const plotHeight = 118;

    return candles.map((candle) => {
      const top = Math.max(4, Math.round(((bounds.high - candle.high) / range) * plotHeight));
      const bar = Math.max(18, Math.round(((candle.high - candle.low) / range) * plotHeight));
      const bottom = Math.max(4, plotHeight - top - bar + 18);
      return {
        top,
        bar,
        bottom
      };
    });
  }

  getPriceBounds(candles) {
    const highs = candles.map((candle) => candle.high);
    const lows = candles.map((candle) => candle.low);
    return {
      high: Math.max(...highs),
      low: Math.min(...lows)
    };
  }

  formatPrice(value) {
    return `$${Number(value).toFixed(2)}`;
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
