'use strict'

// ヒント表示

import type {
  Position,
  Range,
  TextEditor,
} from 'vscode'
import * as _ from './common'

// ヒント文字を作成する
export function getLabelListByPosition(setting: _.UserSetting, positionList: Position[][]): string[][] {
  // 総個数
  let count = 0
  positionList.forEach((l) => {
    count += l.length
  })

  // ヒントを作成する
  let labelList: string[] = []
  switch (setting.type.hintLengthType) {
    case _.HintLengthType.Fixed:
      labelList = generateFixedLabelList(setting.common.hintCharList, count, setting.type.fixedHintLength)
      break
    case _.HintLengthType.Variable:
      labelList = generateVariableLabelList(setting.common.hintCharList, count)
      break
  }

  // 振り分ける
  const list: string[][] = []
  positionList.forEach((l) => {
    list.push(
      labelList.splice(0, l.length),
    )
  })
  return list
}

// ヒント文字を作成する
export function getLabelListByRange(setting: _.UserSetting, textEditorList: TextEditor[], rangeList: Range[][]): string[][] {
  // 総個数
  let count = 0
  rangeList.forEach((l) => {
    count += l.length
  })

  // 無視する文字を取得する
  const ignoreList: string[] = []
  for (let i = 0; i < textEditorList.length; i++) {
    const editor = textEditorList[i]
    const rl: Range[] = rangeList[i]
    if (!editor || !rl)
      continue

    // 範囲の次の文字
    rl.forEach((r, i) => {
      const line = editor.document.lineAt(r.end.line)
      const s = line.text.charAt(r.end.character)
      if (!!s && !ignoreList.includes(s))
        ignoreList.push(s)
    })
  }

  // 使用する文字列
  const charList = setting.common.hintCharList.filter((c, i) => {
    return (!ignoreList.includes(c))
  })

  // ヒントを作成する
  let labelList: string[] = []
  switch (setting.type.hintLengthType) {
    case _.HintLengthType.Fixed:
      labelList = generateFixedLabelList(charList, count, setting.type.fixedHintLength)
      break
    case _.HintLengthType.Variable:
      labelList = generateVariableLabelList(charList, count)
      break
  }

  // 振り分ける
  const list: string[][] = []
  rangeList.forEach((l) => {
    list.push(
      labelList.splice(0, l.length),
    )
  })
  return list
}

// 深さ優先探索で固定長のヒント列を返す
function generateFixedLabelList(charList: string[], count: number, length: number): string[] {
  // @TODO: もうちょっとスマートな記述できそう
  const dfs = (hint: string, list: string[]): string[] => {
    if (list.length >= count)
      return list
    if (hint.length < length) {
      for (let i = 0; i < charList.length; i++)
        dfs(hint + charList[i], list)
    }
    else {
      list.push(hint)
    }
    return list
  }

  return dfs('', [])
}

// Returns a list of hint strings which will uniquely identify the given number of links.The hint strings may be of different lengths.
// https://github.com/philc/vimium
function generateVariableLabelList(charList: string[], count: number): string[] {
  const hintList: string[] = ['']
  let offset = 0
  while ((hintList.length - offset < count) || (hintList.length == 1)) {
    const hint = hintList[offset++]
    charList.forEach((val: string) => {
      hintList.push(hint + val)
    })
  }

  return hintList.slice(offset, offset + count)
}
