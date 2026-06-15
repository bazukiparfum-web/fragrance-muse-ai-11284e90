import BazukiLabel from "./BazukiLabel";

type Props = {
  imageUrl: string;
  line1: string;
  line2: string;
  displayName: string;
  variant: "center" | "side";
  entryClass: string;
  nameDelayMs?: number;
};

const CampaignBottle = ({ imageUrl, line1, line2, displayName, variant, entryClass, nameDelayMs = 1700 }: Props) => {
  const isCenter = variant === "center";

  return (
    <div className={`bz-bottle-col ${isCenter ? "bz-bottle-center" : "bz-bottle-side"} ${entryClass}`}>
      <div className="bz-bottle-wrap relative">
        {isCenter && <div aria-hidden className="bz-center-glow" />}

        <div className="bz-bottle-inner relative">
          <img
            src={imageUrl}
            alt={`Bazuki ${displayName} fragrance bottle`}
            className="bz-bottle-img"
            loading="eager"
            decoding="async"
          />
          <div className="bz-label-wrap">
            <BazukiLabel line1={line1} line2={line2} className="bz-label-svg" />
            <div aria-hidden className={`bz-shimmer ${isCenter ? "bz-shimmer-loop" : ""}`} />
          </div>
        </div>
      </div>

      <div
        className="bz-name-tag"
        style={{ animationDelay: `${nameDelayMs}ms` }}
      >
        {isCenter && (
          <div className="bz-best-match">✦ Best Match</div>
        )}
        <div className="bz-name-text">{displayName}</div>
      </div>
    </div>
  );
};

export default CampaignBottle;
