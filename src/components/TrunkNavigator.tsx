import React, { useState, useEffect } from 'react';
import './TrunkNavigator.css';

export default function TrunkNavigator({ data, treeImgSrc }) {
  const [currentTab, setCurrentTab] = useState(null);
  const tabs = Object.keys(data);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && data[tabParam]) {
      setCurrentTab(tabParam);
    }
  }, [data]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    const newUrl = new URL(window.location.href);
    if (tab) {
      newUrl.searchParams.set('tab', tab);
    } else {
      newUrl.searchParams.delete('tab');
    }
    window.history.pushState({}, '', newUrl);
  };

  const getDisplayedItems = () => {
    if (!currentTab) {
      return Object.values(data).flat();
    }
    return data[currentTab] || [];
  };

  return (
    <div className="trunk-navigator-container">
      <div
        className={`trunk-wrapper ${currentTab ? 'is-minimized' : 'is-expanded'}`}
      >
        <img src={treeImgSrc} className="upside-down-trunk" alt="Tree Trunk" />

        <div className="rings-overlay">
          {tabs.map((tab, idx) => {
            const isActive = currentTab === tab;
            // Same % width & height → ellipse matches trunk PNG aspect ratio.
            // Outermost approaches 100% = same radius line as wrapper clip-path.
            const t = (idx + 1) / tabs.length;
            const scale = 0.24 + t * 0.58; // ~0.38 → ~0.96
            const zIndex = tabs.length - idx;

            return (
              <button
                key={tab}
                type="button"
                className={`tree-ring ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
                style={{
                  width: `${scale * 100}%`,
                  height: `${scale * 100}%`,
                  zIndex,
                }}
              >
                <span className="ring-label">{tab}</span>
              </button>
            );
          })}

          <button
            type="button"
            className={`tree-ring ring-core ${!currentTab ? 'active' : ''}`}
            onClick={() => handleTabChange(null)}
            style={{
              width: '22%',
              height: '22%',
              zIndex: tabs.length + 1,
            }}
          >
            <span className="ring-label">all</span>
          </button>
        </div>
      </div>

      <div className="cards-grid">
        {getDisplayedItems().map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inspiration-card"
          >
            <div className="card-meta">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
