import React, { useEffect, useRef, useState } from "react"
import root from "react-shadow"

import { minimalSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { EditorView, placeholder, drawSelection, rectangularSelection } from '@codemirror/view'
import { markdown } from "@codemirror/lang-markdown"
import { githubDark, githubLight } from "@uiw/codemirror-theme-github"

import richEditor from 'codemirror-rich-markdoc/src'
import markdocConfig from 'codemirror-rich-markdoc/example/markdoc'
import { languages } from '@codemirror/language-data';
import { Table, Strikethrough } from '@lezer/markdown';
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput } from '@codemirror/language'
// import "../../node_modules/codemirror-rich-markdoc/example/style.css"

export const DuetEditor = ({ markdownContent, onChange, style } : { markdownContent: string, onChange: (val: string) => void, style?: {} }) => {

  const editor = useRef()

  const onUpdate = EditorView.updateListener.of((v) => {
    onChange(v.state.doc.toString())
  })

  const stylesWithRichMarkdoc = {
    ...style,
    ".cm-markdoc-hidden": {
      display: 'none'
    },
    ".cm-markdoc-bullet *": {
      display: 'none'
    },
    ".cm-markdoc-bullet": {
      display: 'inline-block!important',
      background: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'var(--ion-color-dark-shade)' : 'var(--ion-color-light-shade)',
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      marginBottom: '3px'
    },
    ".cm-markdoc-renderBlock": {
      fontFamily: 'sans-serif'
    },
    ".cm-markdoc-renderBlock table": {
      borderCollapse: 'collapse',
      marginLeft: '5px'
    },
    ".cm-markdoc-renderBlock th, .cm-markdoc-renderBlock td": {
      border: '1px solid lightgray',
      padding: '5px 10px'
    },
    ".cm-markdoc-renderBlock blockquote": {
      borderLeft: '3px solid lightgray',
      paddingLeft: '10px',
      margin: '0 0 0 15px'
    },
    ".cm-markdoc-renderBlock p": {
      margin: '3px'
    },
    ".cm-markdoc-tag": {
      color: 'darkgray'
    },
    ".cm-markdoc-fallbackTag": {
      border: '2px solid rgb(97, 70, 155)',
      borderRadius: '3px',
      margin: '0 5px'
    },
    ".cm-markdoc-fallbackTag--name": {
      backgroundColor: 'rgb(97, 70, 155)',
      color: 'white',
      padding: '5px'
    },
    ".cm-markdoc-fallbackTag--inner": {
      padding: '10px'
    },
    ".cm-markdoc-callout": {
      border: "1px solid rgb(227, 232, 238)",
      background: 'rgb(247, 250, 252)',
      borderRadius: '3px',
      display: 'flex',
      padding: '10px',
      margin: '0 5px'
    },
    ".cm-markdoc-callout .icon": {
      fontSize: '24px',
      marginRight: '10px',
      color: 'rgb(164, 205, 254)'
    },
    ".cm-markdoc-callout--warning": {
      backgroundColor: 'rgb(252, 249, 233)',
      borderColor: 'rgb(249, 229, 185)'
    },
    ".cm-markdoc-callout--warning .icon": {
      color: 'rgb(229, 153, 62)'
    }
  }

  useEffect(() => {
    const startState = EditorState.create({
      doc: markdownContent,
      extensions: [
        minimalSetup,
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? githubDark : githubLight,
        // markdown(),
        richEditor({
          markdoc: markdocConfig,
          lezer: {
            codeLanguages: languages,
            extensions: [Table, Strikethrough]
          }
        }),
        onUpdate,
        EditorView.lineWrapping,
        EditorView.baseTheme(stylesWithRichMarkdoc!),
        placeholder('Type out your note here'),
        EditorView.contentAttributes.of({
          autocorrect: "on",
          spellcheck: "true",
          autocapitalize: "on"
        }),
        syntaxHighlighting(defaultHighlightStyle),
        // indentOnInput(),
        drawSelection(),
        rectangularSelection(),
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