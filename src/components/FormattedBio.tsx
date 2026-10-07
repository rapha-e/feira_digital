"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

interface FormattedBioProps {
  bio: string;
  className?: string;
}

export function FormattedBio({ bio, className = "" }: FormattedBioProps) {
  if (!bio) return null;

  // Regex para identificar URLs e menções @instagram
  // Identifica http://, https://, www., ou domínios comuns como *.com, *.com.br, *.nuvem, etc.
  const urlRegex =
    /((?:https?:\/\/|www\.)[^\s]+|(?:[a-zA-Z0-9-]+\.)+(?:com|br|net|org|app|store|shop|me|io|nuvem|site)[^\s]*|@[a-zA-Z0-9_.]+)/gi;

  const lines = bio.split("\n");

  const renderSegment = (text: string, keyPrefix: string) => {
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      const key = `${keyPrefix}-${index}`;

      // Caso seja menção ao Instagram (@usuario)
      if (part.startsWith("@") && part.length > 1) {
        const handle = part.replace(/^@/, "");
        return (
          <a
            key={key}
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors mx-0.5 font-medium"
            title={`Abrir perfil de @${handle} no Instagram`}
          >
            {part}
          </a>
        );
      }

      // Caso seja URL / Link de site
      const isUrl =
        /^https?:\/\//i.test(part) ||
        /^www\./i.test(part) ||
        /\.(com|br|net|org|app|store|shop|me|io|nuvem|site)/i.test(part);

      if (isUrl) {
        let href = part;
        if (!/^https?:\/\//i.test(href)) {
          href = `https://${href}`;
        }

        // Limpar pontuações acidentais no final (como vírgula ou ponto final da frase)
        const cleanHref = href.replace(/[.,;:]+$/, "");
        const displayLabel = part.replace(/[.,;:]+$/, "");

        return (
          <a
            key={key}
            href={cleanHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors mx-0.5 break-all font-medium"
            title={`Visitar ${displayLabel}`}
          >
            <span>{displayLabel}</span>
            <ExternalLink className="w-2.5 h-2.5 text-blue-500 shrink-0" />
          </a>
        );
      }

      return <span key={key}>{part}</span>;
    });
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, lineIndex) => (
        <p key={`line-${lineIndex}`} className="leading-relaxed">
          {renderSegment(line, `line-${lineIndex}`)}
        </p>
      ))}
    </div>
  );
}
