export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = "image/png";

type OgSiteTemplateProps = {
  storeName: string;
  description: string;
};

export function OgSiteTemplate({ storeName, description }: OgSiteTemplateProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "linear-gradient(135deg, #fffaf9 0%, #fde8e8 45%, #c8f0e0 100%)",
        color: "#1e2a4a",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: "28px",
          fontWeight: 700,
          color: "#ff7f6e",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "#ff7f6e",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
          }}
        >
          ✦
        </div>
        {storeName}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: "900px",
          }}
        >
          Adorable kids clothing for every adventure
        </div>
        <div
          style={{
            fontSize: "30px",
            lineHeight: 1.4,
            color: "rgba(30, 42, 74, 0.72)",
            maxWidth: "820px",
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#ff7f6e",
        }}
      >
        theminiwear.com
      </div>
    </div>
  );
}

type OgProductTemplateProps = {
  storeName: string;
  productName: string;
  priceLabel: string;
  categoryName?: string | null;
  imageSrc?: string | null;
};

export function OgProductTemplate({
  storeName,
  productName,
  priceLabel,
  categoryName,
  imageSrc,
}: OgProductTemplateProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #fffaf9 0%, #fde8e8 50%, #eef8ff 100%)",
        color: "#1e2a4a",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#ff7f6e",
          }}
        >
          {storeName}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {categoryName ? (
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(30, 42, 74, 0.55)",
              }}
            >
              {categoryName}
            </div>
          ) : null}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              maxWidth: "560px",
            }}
          >
            {productName}
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 800,
              color: "#ff7f6e",
            }}
          >
            {priceLabel}
          </div>
        </div>

        <div
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "rgba(30, 42, 74, 0.55)",
          }}
        >
          theminiwear.com
        </div>
      </div>

      <div
        style={{
          width: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "32px",
            overflow: "hidden",
            background: "white",
            boxShadow: "0 24px 60px rgba(30, 42, 74, 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: "120px",
              }}
            >
              👕
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
