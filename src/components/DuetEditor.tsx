import React, { useEffect, useRef, useState } from "react"
import root from "react-shadow"

import { minimalSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { EditorView, placeholder } from '@codemirror/view'
import { markdown } from "@codemirror/lang-markdown"
import { oneDark } from "@codemirror/theme-one-dark"

export const DuetEditor = ({ markdownContent, onChange, style } : { markdownContent: string, onChange: (val: string) => void, style?: {} }) => {

  const editor = useRef()

  const onUpdate = EditorView.updateListener.of((v) => {
    onChange(v.state.doc.toString())
  })

  useEffect(() => {
    const startState = EditorState.create({
      doc: markdownContent,
      extensions: [
        minimalSetup,
        oneDark,
        markdown(),
        onUpdate,
        EditorView.lineWrapping,
        EditorView.baseTheme(style!),
        placeholder('Note'),
        EditorView.contentAttributes.of({
          autocorrect: "on",
          spellcheck: "true",
          autocapitalize: "on"
        })
      ],
    })

    const view = new EditorView({ 
      state: startState,
      parent: editor.current?.shadowRoot 
    })

    view.focus()

    return () => {
      view.destroy()
    }
  }, [])

  return (
    <root.div className="duet-cm-editor" ref={editor}></root.div>
  )
}