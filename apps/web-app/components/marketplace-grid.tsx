import type { GatewayMarketplaceItem } from "@decharge/sdk";
import { SolanaPayButton } from "./solana-pay-button";

const categoryChip: Record<GatewayMarketplaceItem["category"], string> = {
  energy: "bg-emerald-500/10 text-emerald-200",
  mobility: "bg-sky-500/10 text-sky-200",
  perks: "bg-violet-500/10 text-violet-200",
};

interface MarketplaceGridProps {
  items: GatewayMarketplaceItem[];
}

export function MarketplaceGrid({ items }: MarketplaceGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Points marketplace</h3>
          <p className="text-sm text-white/60">
            Redeem energy boosts, mobility perks, and metaverse upgrades in one tap.
          </p>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wider text-white/60">
          {items.length} offers
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-5 shadow-lg backdrop-blur transition hover:border-white/15"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${categoryChip[item.category]}`}>
                  {item.category}
                </span>
                <span className="text-xs uppercase tracking-wide text-white/50">{item.deliveryType}</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-sm text-white/60">{item.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-white/5 pt-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40">Cost</p>
                <p className="text-lg font-semibold text-emerald-200">
                  {item.pointsCost.toLocaleString()} pts
                  <span className="ml-2 text-xs text-white/50">(~${item.cashPriceUsd.toFixed(0)})</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-white/40">Savings</p>
                <p className="text-lg font-semibold text-white">{item.savingsPercent}%</p>
                <p className="text-xs text-white/50">{item.inventory} left</p>
              </div>
            </div>
            <SolanaPayButton
              itemId={item.id}
              itemName={item.title}
              pointsCost={item.pointsCost}
              priceUsd={item.cashPriceUsd}
            />
          </article>
        ))}
        {items.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-white/50">
            Marketplace syncing… plug in the simulator or ingest real on-chain events to populate offers.
          </div>
        ) : null}
      </div>
    </div>
  );
}