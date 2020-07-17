'use strict';

// ヒント表示

import {
    Position,
    Range,
    TextEditor,
    TextEditorDecorationType,
    DecorationOptions,
    window
} from 'vscode';
import * as _ from './common';

// 装飾を適用する
export function applyDecoration(status: _.ExtensionStatus): boolean {
    status.targetEditorList.forEach((editor, i) => {
        let positionList = status.positionList[i];
        let labelList = status.labelList[i];
        let foreground = status.foregroundDecorationList[i];
        let background = status.backgroundDecorationList[i];
        let target = status.targetEditorList[i];

        if (!!positionList && !!labelList && !!target) {
            let list = getHintParamList(positionList, labelList, status.inputLabel);
            if (foreground) {
                target.setDecorations(foreground, getForegroundDecorationOptionList(list));
            }
            if (background) {
                target.setDecorations(background, getBackgroundDecorationOptionList(list));
            }
        }
    });

    return true;
}

// 位置とコードを結合する
function getHintParamList(positionList: Position[], labelList: string[], inputLabel: string): _.HintParam[] {
    let list: _.HintParam[] = positionList.map((p, i) => {
        if (!!labelList[i]) {
            return { pos: p, label: labelList[i] };
        }
        return { pos: p, label: '' };
    });

    // 入力に一致するものだけ
    let re = new RegExp('^' + inputLabel + '.*', 'i');
    return list.filter((param, i) => {
        return (re.test(param.label));
    });
}

// 装飾タイプを作成する
export function getForegroundDecorationList(setting: _.UserSetting, textEditorList: TextEditor[]): TextEditorDecorationType[] {
    let list: TextEditorDecorationType[] = [];
    textEditorList.forEach((editor) => {
        list.push(window.createTextEditorDecorationType({
            after: {
                color: setting.theme.fontColor,
                width: '0',
                fontWeight: 'normal'
            },
        }));
    });
    return list;
}

// 装飾タイプを作成する
export function getBackgroundDecorationList(setting: _.UserSetting, textEditorList: TextEditor[]): TextEditorDecorationType[] {
    let list: TextEditorDecorationType[] = [];
    textEditorList.forEach((editor) => {
        list.push(window.createTextEditorDecorationType({
            backgroundColor: setting.theme.backgroundColor,
            opacity: '0',
            borderRadius: '2px',
            border: 'none'
        }));
    });
    return list;
}

// 装飾オプションを作成する
function getForegroundDecorationOptionList(list: _.HintParam[]): DecorationOptions[] {
    return list.map((param, i) => {
        return {
            range: new Range(param.pos.line, param.pos.character, param.pos.line, param.pos.character),
            renderOptions: {
                after: {
                    contentText: param.label,
                }
            }
        }
    });
}

// 装飾オプションを作成する
function getBackgroundDecorationOptionList(list: _.HintParam[]): DecorationOptions[] {
    return list.map((param, i) => {
        return {
            range: new Range(param.pos.line, param.pos.character, param.pos.line, param.pos.character + param.label.length),
        }
    });
}

