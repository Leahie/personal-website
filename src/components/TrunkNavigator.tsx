import { useState, useEffect, useRef } from 'react';
import './TrunkNavigator.css';

type InspirationData = Record<string, unknown[]>;

export default function TrunkNavigator({ data }: { data: InspirationData }) {
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tabs = Object.keys(data);

  const announceTab = (tab: string | null) => {
    window.dispatchEvent(
      new CustomEvent('inspiration-tab', { detail: { tab } })
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const initial =
      tabParam && data[tabParam] ? tabParam : null;
    setCurrentTab(initial);
    announceTab(initial);
  }, [data]);

  // Touch devices stick :hover after tap — close when tapping outside instead.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const handleTabChange = (tab: string | null) => {
    setCurrentTab(tab);
    const newUrl = new URL(window.location.href);
    if (tab) {
      newUrl.searchParams.set('tab', tab);
    } else {
      newUrl.searchParams.delete('tab');
    }
    window.history.pushState({}, '', newUrl);
    announceTab(tab);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const topicLabel = currentTab ?? 'all';

  return (
    <div className="trunk-navigator-container">
      <div
        ref={wrapperRef}
        className={`trunk-wrapper${open ? ' is-open' : ''}`}
        onClick={() => setOpen(true)}
        onMouseLeave={() => {
          // Don't clear on touch — iOS can fire mouseleave right after tap.
          if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            setOpen(false);
          }
        }}
      >
        <div className="trunk-stage">
          <div className="rings-overlay">
            {(() => {
              const ringCount = tabs.length + 1;
              return (
                <>
                  {tabs.map((tab, idx) => {
                    const isActive = currentTab === tab;
                    const ringIndex = idx + 2;
                    const s = ringIndex / ringCount;
                    const zIndex = tabs.length - idx;

                    return (
                      <button
                        key={tab}
                        type="button"
                        className={`tree-ring ${isActive ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab)}
                        style={{
                          width: `${s * 100}%`,
                          height: `${s * 200}%`,
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
                      width: `${(1 / ringCount) * 100}%`,
                      height: `${(1 / ringCount) * 200}%`,
                      zIndex: tabs.length + 1,
                    }}
                  >
                    <span className="ring-label">all</span>
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        <p className="collapsed-topic">{topicLabel}</p>
      </div>
    </div>
  );
}
