import { NavLink } from "@remix-run/react";
import CommentIcon from "./icons/CommentIcon";
import ArticleIcon from "./icons/ArticleIcon";

interface CommentShowCardProps {
  commentContent: string;
  commentDateGmt: string;
  commentAuthor: string;
  postId: number;
  dimPosts: {
      postTitle: string;
  };
}

export default function CommentShowCard({
  commentContent,
  commentDateGmt,
  commentAuthor,
  postId,
  dimPosts,
}: CommentShowCardProps) {
  const formattedCommentDate = new Date(commentDateGmt).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
  }).replace(/\//g, "-");

  return (
      <div className="bg-base-100 border-2 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
              <p className="text-base-content text-sm comment-timestamp">{formattedCommentDate}</p>
              <span className="text-lg font-bold text-base-content comment-author">{commentAuthor}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-2 mb-2 items-center">
              <div className="w-6 h-6">
                  <CommentIcon />
              </div>
              <p className="text-base-content comment-content">{commentContent}</p>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
              <div className="w-6 h-6">
                  <ArticleIcon />
              </div>
              <NavLink to={`/archives/${postId}`} className="text-xl font-bold text-info underline underline-offset-4 post-title">{dimPosts.postTitle}</NavLink>
          </div>
      </div>
  );
}