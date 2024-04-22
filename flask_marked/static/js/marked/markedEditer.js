$(document).ready(function () {
    const newMarked = new marked.Marked(
        markedHighlight({
            langPrefix: 'hljs language-',
            highlight(code, lang, info) {
                if (hljs.getLanguage(lang)) {
                    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                    return hljs.highlight(code, { language }).value;
                }
            }
        })
    );

    const $markedEdits = $('.marked-edit');
    $markedEdits.each(function () {
        const $markedEdit = $(this);
        const $inputTextarea = $markedEdit.find(".marked-input");
        const $preview = $markedEdit.find(".marked-preview");
        const $markedToolbar = $markedEdit.find(".marked-toolbar");

        // 记录历史
        let doing = false;
        const undostack = new UndoStack(null, $inputTextarea);
        $inputTextarea.undo = function () {
            undostack.undo();
            updataHtml();
        };
        $inputTextarea.redo = function () {
            undostack.redo();
            updataHtml();
        };
        function writeHistory() {
            undostack.push($inputTextarea.val());
        }

        // 更新文本
        function updataHtml() {
            const html = newMarked.parse($inputTextarea.val());
            $preview.html(html);
        }
        $inputTextarea.bind('input propertychange', 'textarea', function () {
            updataHtml();
            if (!doing) {
                writeHistory();
            }
        }
        );
        $inputTextarea.bind('compositionstart', function () {
            doing = true;
        });
        $inputTextarea.bind('compositionend', function () {
            // 用来防止中文书法中奇怪的问题
            doing = false;
            writeHistory();
        });

        // 按钮绑定
        $markedToolbar.on('click', 'button', function () {
            const $button = $(this);
            const newSel = buttonEvent($inputTextarea, $button.val());

            // 使用undo 和 redo时就不需要更新了
            if ($button.val() != 'undo' && $button.val() != 'redo') {
                updataHtml();
                $inputTextarea.setCaretPosition(newSel.newSelStartPos, newSel.newSelEndPos);
                writeHistory();
            }
        });

        // 快捷键
        $inputTextarea.on("keydown", function (event) {
            // 禁用Tab键
            if (event.which === 9) {
                let newSel;
                event.preventDefault();
                if (event.shiftKey) {
                    newSel = buttonEvent($inputTextarea, 'leftIndent');
                } else {
                    newSel = buttonEvent($inputTextarea, 'rightIndent');
                }
                updataHtml();
                $inputTextarea.setCaretPosition(newSel.newSelStartPos, newSel.newSelEndPos);
                writeHistory();
            } else if (event.which === 90) {
                if (event.ctrlKey) {
                    event.preventDefault();
                    $inputTextarea.undo();
                }
            } else if (event.which === 89) {
                if (event.ctrlKey) {
                    event.preventDefault();
                    $inputTextarea.redo();
                }
            }
        });

        // 全局快捷键
        $(document).on("keydown", function (event) {
            if (event.which === 90) {
                if (event.ctrlKey) {
                    event.preventDefault();
                }
            } else if (event.which === 89) {
                if (event.ctrlKey) {
                    event.preventDefault();
                }
            }
        });
    });

    // 按钮效果
    function buttonEvent($inputTextarea, button_value) {
        const start = $inputTextarea[0].selectionStart;
        const end = $inputTextarea[0].selectionEnd;
        let newSelStartPos = start;
        let newSelEndPos = end;

        const selectedText = $inputTextarea.val().substring(start, end);

        let modifiedText;
        let newText;
        switch (button_value) {
            case 'undo':
                $inputTextarea.undo();
                break;
            case 'redo':
                $inputTextarea.redo();
                break;
            case 'bold':
                modifiedText = "**" + selectedText + "**";
                newSelStartPos += selectedText.length + 2;
                newSelEndPos = newSelStartPos;
                break;
            case 'strikethrough':
                modifiedText = "~~" + selectedText + "~~";
                newSelStartPos += selectedText.length + 2;
                newSelEndPos = newSelStartPos;
                break;
            case 'italic':
                modifiedText = "*" + selectedText + "*";
                newSelStartPos += selectedText.length + 1;
                newSelEndPos = newSelStartPos;
                break;
            case 'blockquote':
                modifiedText = "> " + selectedText;
                newSelStartPos += selectedText.length + 2;
                newSelEndPos = newSelStartPos;
                break;
            case 'uppercase':
                modifiedText = selectedText.toUpperCase();
                break;
            case 'lowercase':
                modifiedText = selectedText.toLowerCase();
                break;
            case 'heading1':
                modifiedText = "# " + selectedText;
                newSelStartPos += selectedText.length + 2;
                newSelEndPos = newSelStartPos;
                break;
            case 'heading2':
                modifiedText = "## " + selectedText;
                newSelStartPos += selectedText.length + 3;
                newSelEndPos = newSelStartPos;
                break;
            case 'heading3':
                modifiedText = "### " + selectedText;
                newSelStartPos += selectedText.length + 4;
                newSelEndPos = newSelStartPos;
                break;
            case 'heading4':
                modifiedText = "#### " + selectedText;
                newSelStartPos += selectedText.length + 5;
                newSelEndPos = newSelStartPos;
                break;
            case 'heading5':
                modifiedText = "##### " + selectedText;
                newSelStartPos += selectedText.length + 6;
                newSelEndPos = newSelStartPos;
                break;
            case 'heading6':
                modifiedText = "###### " + selectedText;
                newSelStartPos += selectedText.length + 7;
                newSelEndPos = newSelStartPos;
                break;
            case 'orderedList':
                modifiedText = "1. " + selectedText;
                newSelStartPos += selectedText.length + 3;
                newSelEndPos = newSelStartPos;
                break;
            case 'unorderedList':
                modifiedText = "- " + selectedText;
                newSelStartPos += selectedText.length + 2;
                newSelEndPos = newSelStartPos;
                break;
            case 'horizontalRule':
                modifiedText = "\n------------\n";
                newSelStartPos += selectedText.length + 14;
                newSelEndPos = newSelStartPos;
                break;
            case 'link':
                if (selectedText) {
                    modifiedText = "[" + selectedText + "](链接)";
                    newSelStartPos += selectedText.length + 3;
                    newSelEndPos = newSelStartPos + 2;
                } else {
                    modifiedText = "[" + "替换名称" + "](链接)";
                    newSelStartPos += 1;
                    newSelEndPos = newSelStartPos + 4;
                }

                break;
            case 'image':
                if (selectedText) {
                    modifiedText = '![' + selectedText + '](链接 "' + selectedText + '")';
                    newSelStartPos += selectedText.length + 4;
                    newSelEndPos = newSelStartPos + 2;
                } else {
                    modifiedText = '![' + '替换名称' + '](链接 "' + '图片标题' + '")';
                    newSelStartPos += 2;
                    newSelEndPos = newSelStartPos + 4;
                }

                break;
            case 'code':
                modifiedText = "`" + selectedText + "`";
                newSelStartPos += selectedText.length + 1;
                newSelEndPos = newSelStartPos;
                break;
            case 'fencedCodeBlock':
                modifiedText = "```代码类型\n" + selectedText + "\n```";
                newSelStartPos += 3;
                newSelEndPos = newSelStartPos + 4;
                break;
            case 'taskList':
                modifiedText = "- [ ] " + selectedText;
                newSelStartPos += 3;
                newSelEndPos = newSelStartPos + 1;
                break;
            case 'rightIndent':
                modifiedText = "    ";
                if (selectedText.includes("\n")) {
                    // 多行选择时，第一行可能选择的不是完整的段，因此需要查找第一行真实的位置
                    // 合成字符串的时候应该到start就就结束，start是选择字符串的第一个位置
                    const selFirstPos = selectedText.indexOf("\n") + start;
                    const beforeText = $inputTextarea.val().substring(0, selFirstPos);
                    const firstReturnIndex = beforeText.lastIndexOf("\n") + 1;
                    const newBeforeText = beforeText.substring(0, firstReturnIndex) + modifiedText + beforeText.substring(firstReturnIndex, start);
                    newSelStartPos += modifiedText.length;
                    newSelEndPos += modifiedText.length;

                    // 处理选择的字符串
                    // 搜索每一个 \n 换行符，在换行符后面增加新的字符串
                    let newSelectedText = '';
                    let lastPos = -1;
                    let pos = selectedText.indexOf("\n");
                    while (pos != -1) {
                        newSelectedText = newSelectedText + selectedText.substring(lastPos + 1, pos + 1) + modifiedText;
                        newSelEndPos += modifiedText.length;

                        lastPos = pos;
                        pos = selectedText.indexOf("\n", lastPos + 1);

                        if (pos == -1) {
                            newSelectedText = newSelectedText + selectedText.substring(lastPos + 1);
                            break;
                        }
                    }
                    // 如果一个都没有的话，重新加回去
                    if (!newSelectedText) {
                        newSelectedText = selectedText;
                    }

                    newText = newBeforeText + newSelectedText + $inputTextarea.val().substring(end);
                } else {
                    newSelStartPos += 4;
                    newSelEndPos = newSelStartPos;
                }
                break;
            case 'leftIndent':
                // 处理第一行
                modifiedText = "    ";

                const beforeText = $inputTextarea.val().substring(0, start);
                const firstReturnIndex = beforeText.lastIndexOf("\n");
                const selectFirstLineText = beforeText.substring(firstReturnIndex + 1, start);
                let newBeforeText;
                if (selectFirstLineText.substring(0, 4) === modifiedText) {
                    newBeforeText = beforeText.substring(0, firstReturnIndex + 1) + selectFirstLineText.substring(4);
                    newSelStartPos -= modifiedText.length;
                    newSelEndPos -= modifiedText.length;
                } else {
                    newBeforeText = beforeText;
                }

                // 处理每一个 \n 后跟着的"    "
                let newModifiedSelText = selectedText;
                let newSelectedText = '';
                let lastPos = -1;
                let pos = newModifiedSelText.indexOf("\n" + modifiedText);
                while (pos != -1) {
                    newSelectedText = newSelectedText + newModifiedSelText.substring(lastPos + 1, pos + 1);
                    newModifiedSelText = newModifiedSelText.substring(pos + 5);
                    newSelEndPos -= modifiedText.length;

                    pos = newModifiedSelText.indexOf("\n" + modifiedText, pos + 1);
                    if (pos == -1) {
                        newSelectedText += newModifiedSelText;
                    }
                }
                // 如果一个都没有的话，重新加回去
                if (!newSelectedText) {
                    newSelectedText = selectedText;
                }
                newText = newBeforeText + newSelectedText + $inputTextarea.val().substring(end);

                break;
            default:
                console.log(button_value);
        }

        if (!newText && modifiedText) {
            newText = $inputTextarea.val().substring(0, start) + modifiedText + $inputTextarea.val().substring(end);
        }
        if (newText) {
            $inputTextarea.val(newText);
        }

        // 需要更新才能看到新的预览效果
        // updataHtml();
        return { newSelStartPos: newSelStartPos, newSelEndPos: newSelEndPos };
    }

    // 移动光标
    $.fn.setCaretPosition = function (start, end) {
        return this.each(function () {
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(start, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };

    function UndoItem(data) {
        this.data = data;
    }

    function UndoStack(self, $inputTextarea) {
        this.stack = [];
        this.current = -1;
        this.self = self;
        this.$inputTextarea = $inputTextarea;
    }

    UndoStack.prototype.push = function (data) {
        if (this.current == -1) {
            this.current++;
            this.stack.splice(this.current);
            this.stack.push(new UndoItem(""));
        }

        this.current++;
        this.stack.splice(this.current);
        this.stack.push(new UndoItem(data));
    };

    UndoStack.prototype.undo = function () {
        var item;

        if (this.current > 0) {
            this.current--;
            item = this.stack[this.current];
            this.$inputTextarea.val(item.data);
        } else {
            // throw new Error("Already at oldest change");
        }
    };

    UndoStack.prototype.redo = function () {
        var item;

        item = this.stack[this.current + 1];
        if (item) {
            this.$inputTextarea.val(item.data);
            this.current++;
        } else {
            // throw new Error("Already at newest change");
        }
    };

    UndoStack.prototype.invalidateAll = function () {
        this.stack = [];
        this.current = -1;
    };
});
