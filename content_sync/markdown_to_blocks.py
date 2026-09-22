"""Convert Markdown into the existing SyncRadar content_json schema."""

from __future__ import annotations

from typing import Any

from markdown_it import MarkdownIt
from markdown_it.token import Token
from mdit_py_plugins.front_matter import front_matter_plugin


md = MarkdownIt("commonmark", {"html": False}).enable("table").use(front_matter_plugin)


def markdown_to_content_json(markdown: str) -> dict[str, Any]:
    tokens = md.parse(markdown)
    return {"type": "doc", "content": tokens_to_blocks(tokens)}


def tokens_to_blocks(tokens: list[Token]) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    index = 0
    while index < len(tokens):
        token = tokens[index]
        if token.type == "heading_open":
            level = int(token.tag[1]) if token.tag.startswith("h") else 2
            text = inline_markdown(tokens[index + 1]) if index + 1 < len(tokens) else ""
            if text:
                blocks.append({"type": "heading", "level": min(max(level, 1), 3), "text": text})
            index += 3
            continue
        if token.type == "paragraph_open":
            inline = tokens[index + 1] if index + 1 < len(tokens) else None
            blocks.extend(blocks_from_paragraph(inline))
            index += 3
            continue
        if token.type == "fence":
            code = token.content.rstrip("\n")
            if code:
                language = token.info.strip() or None
                block: dict[str, Any] = {"type": "code", "code": code}
                if language:
                    block["language"] = language
                blocks.append(block)
            index += 1
            continue
        if token.type == "blockquote_open":
            close = find_close(tokens, index, "blockquote_close")
            quote_tokens = tokens[index + 1 : close]
            blocks.append(callout_from_quote(quote_tokens))
            index = close + 1
            continue
        if token.type in {"bullet_list_open", "ordered_list_open"}:
            close = find_close(tokens, index, token.type.replace("_open", "_close"))
            items = list_items(tokens[index + 1 : close])
            if items:
                blocks.append(
                    {
                        "type": "list",
                        "style": "ordered" if token.type == "ordered_list_open" else "bullet",
                        "items": items,
                    }
                )
            index = close + 1
            continue
        if token.type == "table_open":
            close = find_close(tokens, index, "table_close")
            table = table_from_tokens(tokens[index + 1 : close])
            if table:
                blocks.append(table)
            index = close + 1
            continue
        index += 1
    return [block for block in blocks if block]


def blocks_from_paragraph(inline: Token | None) -> list[dict[str, Any]]:
    if inline is None or inline.type != "inline":
        return []
    children = inline.children or []
    if len(children) == 1 and children[0].type == "image":
        src = children[0].attrGet("src") or ""
        alt = children[0].content or children[0].attrGet("alt") or ""
        return [{"type": "image", "src": src, "alt": alt}] if src else []
    if is_standalone_link(children):
        link = children[0] if children[0].type == "link_open" else children[1]
        href = link.attrGet("href") or ""
        text = "".join(child.content for child in children if child.type == "text").strip() or href
        return [{"type": "link", "href": href, "text": text}] if href and text else []
    text = inline_markdown(inline)
    return [{"type": "paragraph", "text": text}] if text else []


def is_standalone_link(children: list[Token]) -> bool:
    meaningful = [child for child in children if child.type not in {"softbreak"}]
    if len(meaningful) < 2:
        return False
    return meaningful[0].type == "link_open" and meaningful[-1].type == "link_close" and all(
        child.type in {"link_open", "link_close", "text"} for child in meaningful
    )


def callout_from_quote(tokens: list[Token]) -> dict[str, Any]:
    text = " ".join(inline_markdown(token) for token in tokens if token.type == "inline").strip()
    tone = "info"
    lowered = text.lower()
    if lowered.startswith("[!warning]") or lowered.startswith("[!caution]"):
        tone = "warning"
        text = strip_callout_marker(text)
    elif lowered.startswith("[!tip]") or lowered.startswith("[!hint]"):
        tone = "tip"
        text = strip_callout_marker(text)
    elif lowered.startswith("[!note]") or lowered.startswith("[!info]"):
        tone = "info"
        text = strip_callout_marker(text)
    return {"type": "callout", "tone": tone, "text": text or "Note"}


def strip_callout_marker(text: str) -> str:
    closing = text.find("]")
    if closing == -1:
        return text
    return text[closing + 1 :].lstrip(" :").strip()


def list_items(tokens: list[Token]) -> list[str]:
    items: list[str] = []
    for token in tokens:
        if token.type == "inline":
            text = inline_markdown(token)
            if text:
                items.append(text)
    return items


def table_from_tokens(tokens: list[Token]) -> dict[str, Any] | None:
    headers: list[str] = []
    rows: list[list[str]] = []
    current_row: list[str] = []
    in_header = False
    for token in tokens:
        if token.type == "thead_open":
            in_header = True
        elif token.type == "thead_close":
            in_header = False
        elif token.type == "tr_open":
            current_row = []
        elif token.type == "inline":
            current_row.append(inline_markdown(token))
        elif token.type == "tr_close":
            if current_row:
                if in_header:
                    headers = current_row
                else:
                    rows.append(current_row)
    if not rows and not headers:
        return None
    block: dict[str, Any] = {"type": "table", "rows": rows}
    if headers:
        block["headers"] = headers
    return block


def inline_text(token: Token | None) -> str:
    if token is None:
        return ""
    if token.children:
        parts: list[str] = []
        for child in token.children:
            if child.type == "text":
                parts.append(child.content)
            elif child.type == "code_inline":
                parts.append(child.content)
            elif child.type == "softbreak":
                parts.append(" ")
            elif child.type == "image":
                parts.append(child.attrGet("alt") or child.content or "")
            elif child.children:
                parts.append(inline_text(child))
        return "".join(parts).strip()
    return (token.content or "").strip()


def inline_markdown(token: Token | None) -> str:
    """Keep source Markdown marks so the frontend can render inline formatting."""
    if token is None:
        return ""
    return (token.content or inline_text(token)).strip()


def find_close(tokens: list[Token], start: int, close_type: str) -> int:
    depth = 0
    open_type = close_type.replace("_close", "_open")
    for index in range(start, len(tokens)):
        if tokens[index].type == open_type:
            depth += 1
        elif tokens[index].type == close_type:
            depth -= 1
            if depth == 0:
                return index
    return len(tokens) - 1
