import React, { useState, useEffect } from 'react';
import { commentService } from '../../services/api';
import MemberAvatar from '../common/MemberAvatar';
import { Send, Trash2, Edit2, AtSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CommentSection = ({ entityType, entityId, projectId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    try {
      const { data } = await commentService.getComments(entityType, entityId);
      if (data.success) {
        setComments(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (entityId) fetchComments();
  }, [entityType, entityId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await commentService.addComment({
        content,
        entityType,
        entityId,
        projectId,
      });
      if (data.success) {
        setContent('');
        setComments((prev) => [...prev, data.data]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await commentService.deleteComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async (id) => {
    try {
      const { data } = await commentService.updateComment(id, editContent);
      if (data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === id ? data.data : c))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
        <span>Comments ({comments.length})</span>
        <span className="text-xs text-slate-400 font-normal">Use @username to notify team members</span>
      </h4>

      {/* Comment Input */}
      <form onSubmit={handleAddComment} className="flex gap-2">
        <MemberAvatar user={user} size="sm" />
        <div className="flex-1 relative">
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment or mention @Rahul..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="absolute right-2 bottom-2 p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 text-xs"
          >
            <div className="flex items-center justify-between">
              <MemberAvatar user={comment.author} size="sm" showName />
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                {comment.author?._id === user?._id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditContent(comment.content);
                      }}
                      className="hover:text-sky-400"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {editingId === comment._id ? (
              <div className="mt-2 space-y-2">
                <textarea
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 text-[10px] text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditSave(comment._id)}
                    className="px-2 py-1 text-[10px] bg-sky-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 pl-8 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
