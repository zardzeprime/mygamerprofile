import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type AvapgvReportStatus = "BOM" | "+/-" | "RUIM";
export type AvapgvReportSeverity = "info" | "warning" | "critical";

export type AvapgvReportData = {
  status: AvapgvReportStatus;
  severity: AvapgvReportSeverity;
  title: string;
  owningCore: string;
  changed: string;
  reference: string;
  impact: string;
  nextAction: string;
  timestamp: string;
  referenceUrl?: string;
  details?: string;
};

const statusStyles: Record<
  AvapgvReportStatus,
  { background: string; border: string; color: string }
> = {
  BOM: {
    background: "#14251C",
    border: "#315E42",
    color: "#91D5A8",
  },
  "+/-": {
    background: "#2A2416",
    border: "#6B5929",
    color: "#E4C977",
  },
  RUIM: {
    background: "#2A1718",
    border: "#71373A",
    color: "#F0A4A8",
  },
};

const severityLabels: Record<AvapgvReportSeverity, string> = {
  info: "Informativo",
  warning: "Atenção",
  critical: "Crítico",
};

const cardStyle = {
  backgroundColor: "#121419",
  border: "1px solid #292C33",
  borderRadius: "14px",
  padding: "18px",
  marginBottom: "12px",
};

function ReportCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Section style={cardStyle}>
      <Text
        style={{
          color: "#C9A95D",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          margin: "0 0 8px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: "#F3F1EA",
          fontSize: "14px",
          lineHeight: "22px",
          margin: 0,
        }}
      >
        {children}
      </Text>
    </Section>
  );
}

export function AvapgvReportEmail({
  status,
  severity,
  title,
  owningCore,
  changed,
  reference,
  impact,
  nextAction,
  timestamp,
  referenceUrl,
  details,
}: AvapgvReportData) {
  const statusStyle = statusStyles[status] ?? statusStyles["+/-"];
  const preview = `AVAPGV · ${status} · ${title}`;

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#090A0C",
          color: "#F3F1EA",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
          margin: 0,
          padding: "28px 12px",
        }}
      >
        <Container
          style={{
            margin: "0 auto",
            maxWidth: "620px",
            width: "100%",
          }}
        >
          <Section
            style={{
              borderBottom: "1px solid #292C33",
              marginBottom: "20px",
              paddingBottom: "16px",
            }}
          >
            <Text
              style={{
                color: "#C9A95D",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                margin: "0 0 9px",
              }}
            >
              MG PROFILE · OS SETE
            </Text>
            <Heading
              as="h1"
              style={{
                color: "#F7F4EB",
                fontSize: "24px",
                lineHeight: "31px",
                margin: "0 0 12px",
              }}
            >
              {title}
            </Heading>
            <Section>
              <Text
                style={{
                  ...statusStyle,
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderRadius: "999px",
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: 800,
                  margin: 0,
                  padding: "6px 10px",
                }}
              >
                {status}
              </Text>
              <Text
                style={{
                  color: "#8F949E",
                  display: "inline-block",
                  fontSize: "12px",
                  margin: "0 0 0 10px",
                }}
              >
                {severityLabels[severity] ?? severityLabels.warning}
              </Text>
            </Section>
          </Section>

          <ReportCard label="Responsável">{owningCore}</ReportCard>
          <ReportCard label="O que mudou">{changed}</ReportCard>

          <Section style={cardStyle}>
            <Text
              style={{
                color: "#C9A95D",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                margin: "0 0 8px",
                textTransform: "uppercase",
              }}
            >
              Referência concreta
            </Text>
            {referenceUrl ? (
              <Link
                href={referenceUrl}
                style={{
                  color: "#E4C977",
                  fontSize: "14px",
                  lineHeight: "22px",
                  textDecoration: "underline",
                }}
              >
                {reference}
              </Link>
            ) : (
              <Text
                style={{
                  color: "#F3F1EA",
                  fontSize: "14px",
                  lineHeight: "22px",
                  margin: 0,
                }}
              >
                {reference}
              </Text>
            )}
          </Section>

          <ReportCard label="Risco / impacto">{impact}</ReportCard>
          <ReportCard label="Próxima ação">{nextAction}</ReportCard>

          {details ? <ReportCard label="Observações">{details}</ReportCard> : null}

          <Hr
            style={{
              borderColor: "#292C33",
              margin: "22px 0 16px",
            }}
          />
          <Text
            style={{
              color: "#8F949E",
              fontSize: "11px",
              lineHeight: "18px",
              margin: "0 0 5px",
            }}
          >
            Gerado em {timestamp} · horário da Bahia
          </Text>
          <Text
            style={{
              color: "#676C75",
              fontSize: "10px",
              lineHeight: "17px",
              margin: 0,
            }}
          >
            Relatório operacional AVAPGV do MG Profile. Este e-mail não inclui
            chaves, tokens, senhas ou credenciais.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
