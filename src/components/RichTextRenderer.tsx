import React from 'react';
import parse, { HTMLReactParserOptions } from 'html-react-parser';
import { Tweet } from 'react-tweet';

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function isXUrl(url: string): string | null {
  const match = url.match(/(?:x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/);
  return match ? match[1] : null;
}

function processText(text: string): React.ReactNode[] {
  const parts = text.split(URL_REGEX);
  return parts.map((part, index) => {
    if (part.match(URL_REGEX)) {
      const tweetId = isXUrl(part);
      if (tweetId) {
        return (
          <div key={index} className="my-6 flex justify-center w-full max-w-xl mx-auto dark" data-theme="dark">
            <Tweet id={tweetId} />
          </div>
        );
      }
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyan-400)] hover:underline break-all transition-colors duration-300">
          {part}
        </a>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

const options: HTMLReactParserOptions = {
  replace: (domNode: any) => {
    // aタグがすでにXのURLだった場合もTweetに置き換える
    if (domNode.type === 'tag' && domNode.name === 'a') {
      const href = domNode.attribs?.href;
      if (href) {
        const tweetId = isXUrl(href);
        if (tweetId) {
          return (
            <div className="my-6 flex justify-center w-full max-w-xl mx-auto dark" data-theme="dark">
              <Tweet id={tweetId} />
            </div>
          );
        }
      }
      // 通常のAタグの場合はそのまま（Reactコンポーネントツリーを継続）
      return undefined;
    }

    if (domNode.type === 'text') {
      const text = domNode.data;
      if (URL_REGEX.test(text)) {
        return <>{processText(text)}</>;
      }
    }
  }
};

interface RichTextRendererProps {
  content: string;
  isHtml?: boolean;
}

export default function RichTextRenderer({ content, isHtml = false }: RichTextRendererProps) {
  if (!content) return null;

  // もしプレーンテキストなら改行を <br /> に置換してからパースする
  const htmlContent = isHtml ? content : content.replace(/\n/g, '<br />');

  return <>{parse(htmlContent, options)}</>;
}
