import { createSystem, PanelUI, PanelDocument, eq } from '@iwsdk/core';

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
    // Watchlist Interactions
    this.queries.leftPanel.subscribe('qualify', (entity) => {
      const doc = PanelDocument.data.document[entity.index];
      if (!doc) return;
      const stocks = ['aapl', 'googl', 'msft', 'tsla'];
      stocks.forEach(id => {
        const btn = doc.getElementById(`stock-${id}`);
        if (btn) btn.addEventListener('click', () => this.selectStock(id));
      });
    });

    // Chat Interactions
    this.queries.rightPanel.subscribe('qualify', (entity) => {
      const doc = PanelDocument.data.document[entity.index];
      if (!doc) return;
      const btn = doc.getElementById('voice-btn');
      if (btn) btn.addEventListener('click', () => this.handleVoice(doc));
    });
  }

  selectStock(id) {
    const data = this.getStockData(id);
    
    // Update Center
    this.queries.centerPanel.entities.forEach(entity => {
      const doc = PanelDocument.data.document[entity.index];
      if (doc) {
        doc.getElementById('stock-title').setProperties({ text: data.name });
        doc.getElementById('price').setProperties({ text: data.price });
        doc.getElementById('change').setProperties({ text: data.change, color: data.color });
      }
    });

    // Update Right
    this.queries.rightPanel.entities.forEach(entity => {
      const doc = PanelDocument.data.document[entity.index];
      if (doc) {
        doc.getElementById('insight-text').setProperties({ text: data.insight });
        doc.getElementById('rec-text').setProperties({ text: data.rec, color: data.color });
      }
    });
  }

  handleVoice(doc) {
    const chatText = doc.getElementById('chat-response');
    chatText.setProperties({ text: 'Listening...' });
    setTimeout(() => {
      chatText.setProperties({ text: 'AI: Based on moving averages, this stock is currently showing bullish trends.' });
    }, 1500);
  }

  getStockData(id) {
    const db = {
      aapl: { name: 'Apple Inc.', price: '$189.45', change: '+1.25%', color: '#4caf50', insight: 'Strong iPhone sales data suggests Q4 beat.', rec: 'BUY' },
      googl: { name: 'Alphabet Inc.', price: '$142.80', change: '-0.45%', color: '#f44336', insight: 'Ad revenue concerns weighing on short term.', rec: 'HOLD' },
      msft: { name: 'Microsoft', price: '$402.10', change: '+2.10%', color: '#4caf50', insight: 'Cloud dominance and AI integration driving value.', rec: 'STRONG BUY' },
      tsla: { name: 'Tesla Inc.', price: '$175.30', change: '-1.80%', color: '#f44336', insight: 'Margin compression concerns from price cuts.', rec: 'SELL' }
    };
    return db[id];
  }
}