# Comprehensive Markdown Test Sample

This document contains examples of all Markdown syntax elements that the Obsidian Confluence Toolkit plugin should convert to Confluence Wiki Markup.

## Text Formatting

**Bold text** using double asterisks  
*Italic text* using single asterisks  
~~Strikethrough text~~ using double tildes  
`Inline code` using backticks

You can also use _underscores for italic_ and __double underscores for bold__.

## Headings

# Heading Level 1
## Heading Level 2
### Heading Level 3
#### Heading Level 4
##### Heading Level 5
###### Heading Level 6

## Lists

### Unordered Lists

* First level item
* Another first level item
  * Second level nested item
  * Another second level item
    * Third level nested item
* Back to first level

Alternative bullet style:
- Item with dash
- Another item with dash
  - Nested with dash

### Ordered Lists

1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
      1. Deep nested item
3. Third item at first level

### Mixed Lists

1. Numbered item
   * Bullet under numbered
   * Another bullet
2. Nested number
3. Back to numbered

### Task Lists

- [ ] Incomplete task
- [x] Completed task
- [ ] Another incomplete task
  - [x] Completed subtask
  - [ ] Incomplete subtask

## Links

### External Links

[Atlassian](http://www.atlassian.com)  
[Atlassian Website](http://www.atlassian.com "Atlassian Homepage")  
<http://www.example.com>

### Reference Links

[Link to Atlassian][atlassian-link]  
[Another reference][ref1]

[atlassian-link]: http://www.atlassian.com
[ref1]: http://www.example.com

## Images

### Simple Images

![Alt text](image.png)  
![Remote image](http://example.com/image.jpg)

### Obsidian-style Images

![[screenshot.png]]  
![[diagram.svg]]

### Images with Title

![My Image](image.png "Click to enlarge")  
![Screenshot](screenshot.jpg "Application Screenshot")

## Tables

### Simple Table

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Table with Alignment

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
| Text         | Text           | Text          |

### Complex Table

| Column A | Column B | Column C |
|----------|----------|----------|
| **Bold** | *Italic* | ~~Strike~~ |
| `code`   | [Link](http://example.com) | ![image](img.png) |
| Item 1<br>Item 2 | Multi<br>Line | Content |

## Code Blocks

### JavaScript Code

```javascript
function hello() {
    console.log("Hello, World!");
    return true;
}

const greeting = hello();
```

### Python Code with Comments

```python
def fibonacci(n):
    """Calculate fibonacci number recursively."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(10)
print(f"Result: {result}")
```

### Java Code

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        for (int i = 0; i < 10; i++) {
            System.out.println("Count: " + i);
        }
    }
}
```

### SQL Query

```sql
SELECT u.username, u.email, o.order_date, o.total
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
WHERE o.order_date >= '2024-01-01'
ORDER BY o.order_date DESC
LIMIT 100;
```

### Shell Script

```bash
#!/bin/bash

echo "Starting deployment..."

for service in api frontend database; do
    echo "Deploying $service..."
    docker-compose up -d $service
done

echo "Deployment complete!"
```

### TypeScript

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

function getUser(id: number): Promise<User> {
    return fetch(`/api/users/${id}`)
        .then(response => response.json());
}
```

### JSON

```json
{
    "name": "confluence-converter",
    "version": "0.3.3",
    "description": "Convert markdown to Confluence wiki markup",
    "dependencies": {
        "marked": "^15.0.4",
        "escape-string-regexp": "^5.0.0"
    }
}
```

### Code without Language

```
Plain code block without language specification.
No syntax highlighting applied.
    Indentation preserved.
```

## Blockquotes

> This is a block quote.
> It can span multiple lines.
> 
> And include multiple paragraphs.

### Nested Blockquotes

> First level quote
>> Second level quote
>>> Third level quote

### Blockquote with Formatting

> **Bold text in quote**
> 
> *Italic text in quote*
> 
> `Code in quote`
> 
> - List in quote
> - Another item

## Horizontal Rules

Text above the line.

---

Text below the line.

Alternative styles:

***

___

## Line Breaks

Line one  
Line two with two spaces at end

Line three after blank line

Hard break<br>using HTML tag

## HTML Elements

<p>Paragraph with HTML tag</p>

<div>Division element</div>

<br>

<strong>Bold with HTML</strong>  
<em>Italic with HTML</em>  
<code>Code with HTML</code>

## Escaping Special Characters

Use backslash to escape:

\* Not a list item  
\# Not a heading  
\[ Not a link  
\` Not code

## Mixed Content Examples

### Lists with Code

1. First, install dependencies:
   ```bash
   npm install
   ```

2. Then, run the build:
   ```bash
   npm run build
   ```

3. Finally, test the plugin

### Lists with Blockquotes

* Important note:
  > Always back up your vault before installing plugins

* Another consideration:
  > Test in a safe environment first

### Tables with Code

| Language | Example | Output |
|----------|---------|--------|
| JavaScript | `console.log('Hi')` | Prints to console |
| Python | `print('Hi')` | Prints to stdout |
| Ruby | `puts 'Hi'` | Prints to stdout |

## Complex Nested Structures

### Deeply Nested Lists

1. Top level
   1. Second level
      1. Third level
         1. Fourth level
            1. Fifth level
      2. Back to third
   2. Back to second
2. Back to top

### Mixed Nested Lists

- Bullet item
  1. Numbered under bullet
     - Bullet under number
       1. Number under bullet under number
          - Bullet under number under bullet under number
     - Back to bullet
  2. Back to numbered
- Back to bullet

## Special Markdown Features

### Obsidian Wikilinks

[[Page Name]]  
[[Folder/Page Name]]  
[[Page Name|Display Text]]  
[[Page Name#Heading]]

### Footnotes

Here's a sentence with a footnote[^1].

Another sentence with a footnote[^note].

[^1]: This is the first footnote.
[^note]: This is a named footnote.

### Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

### Definition Lists

Term 1
:   Definition 1a
:   Definition 1b

Term 2
:   Definition 2

## Edge Cases

### Empty Elements

Empty paragraph:

Empty blockquote:
>

Empty list:
* 

### Special Characters

Ampersand: &  
Less than: <  
Greater than: >  
Quotes: "text"  
Apostrophe: isn't

### URLs in Text

Visit http://example.com for more info.  
Email: user@example.com

### Multiple Blank Lines


Multiple blank lines above and below.


### Inline HTML with Markdown

This is <em>*emphasized*</em> text.

<div>
**Bold** in a div.
</div>

## Unicode and Emoji

Unicode characters: © ® ™ € £ ¥  
Emoji: 😀 🎉 ✅ ❌ ⚠️ 📝 🚀

## Mathematical Expressions (if supported)

Inline math: $E = mc^2$

Block math:
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

## End of Test Sample

This comprehensive Markdown sample covers most syntax elements that the Obsidian Confluence Toolkit plugin should handle. Use this file to test the conversion from Markdown to Confluence Wiki Markup.

**Test Instructions:**
1. Open this file in Obsidian
2. Run the "Convert to Confluence" command
3. Paste the result into Confluence
4. Verify all elements render correctly
