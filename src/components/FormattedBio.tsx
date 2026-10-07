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
            className="inline-flex items-center font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-1.5 py-0.5 rounded-md transition-colors underline decoration-pink-300 underline-offset-2 mx-0.5"
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
            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 px-2 py-0.5 rounded-md transition-all underline decoration-emerald-400 underline-offset-3 shadow-2xs hover:shadow-xs group mx-0.5"
            title={`Visitar ${displayLabel}`}
          >
            <span>{displayLabel}</span>
            <ExternalLink className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
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
