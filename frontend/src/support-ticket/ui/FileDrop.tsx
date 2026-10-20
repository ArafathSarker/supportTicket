import { useCallback, useEffect, useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'

export interface FileDraft {
  file: File
  fileType: 'image' | 'video' | 'other'
}

function detectDraftType(file: File): FileDraft['fileType'] {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return 'other'
}

/** Accepts picture + video selection with previews; S3 upload happens on submit. */
export function FileDrop({
  onChange,
  accept = 'image/*,video/*',
  label,
}: {
  onChange: (drafts: FileDraft[]) => void
  accept?: string
  label: string
}) {
  const [drafts, setDrafts] = useState<FileDraft[]>([])

  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  const emit = useCallback((next: FileDraft[]) => {
    setDrafts(next)
    onChangeRef.current(next)
  }, [])

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return
      emit([
        ...drafts,
        ...Array.from(incoming)
          .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
          .map((file) => ({ file, fileType: detectDraftType(file) })),
      ])
    },
    [drafts, emit],
  )

  return (
    <div>
      <p className="mb-1 block text-sm font-medium text-slate-700">{label}</p>
      <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-600 hover:border-brand-500 hover:bg-brand-50 transition-colors">
        <Paperclip size={16} />
        Attach picture or video
        <input
          type="file"
          className="sr-only"
          accept={accept}
          multiple
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </label>
      {drafts.length > 0 && (
        <ul className="mt-2 space-y-2">
          {drafts.map(({ file, fileType }) => (
            <li
              key={file.name + file.size}
              className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="text-slate-500">
                {fileType === 'video' ? (
                  <VideoTag />
                ) : (
                  <img src={URL.createObjectURL(file)} className="h-10 w-10 rounded object-cover" alt="" />
                )}
              </span>
              <span className="flex-1 truncate text-slate-700">{file.name}</span>
              <span className="text-xs uppercase text-slate-400">{fileType}</span>
              <button
                type="button"
                className="text-slate-400 hover:text-red-600"
                onClick={() => emit(drafts.filter((d) => d.file !== file))}
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function VideoTag() {
  return <span className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">vid</span>
}
