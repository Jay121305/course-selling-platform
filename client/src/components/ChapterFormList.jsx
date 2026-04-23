const ChapterFormList = ({ chapters, onChange, onAdd, onRemove }) => {
  return (
    <div className="chapter-list">
      <div className="row-between">
        <h3>Chapters</h3>
        <button className="btn btn-ghost" type="button" onClick={onAdd}>
          + Add Chapter
        </button>
      </div>

      {chapters.map((chapter, index) => (
        <div key={index} className="chapter-item">
          <div className="grid-2">
            <label>
              Chapter Title
              <input
                type="text"
                value={chapter.title}
                onChange={(event) =>
                  onChange(index, "title", event.target.value)
                }
                required
              />
            </label>
            <label>
              YouTube URL
              <input
                type="url"
                value={chapter.youtubeUrl}
                onChange={(event) =>
                  onChange(index, "youtubeUrl", event.target.value)
                }
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </label>
          </div>
          <label>
            Summary
            <textarea
              value={chapter.summary}
              onChange={(event) => onChange(index, "summary", event.target.value)}
              rows={2}
            />
          </label>
          {chapters.length > 1 && (
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => onRemove(index)}
            >
              Remove Chapter
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChapterFormList;
