import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService } from 'src/app/service/chat.service';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';

interface Message {
  text: string;
  isUser: boolean;
  time: Date;
  liked?: boolean;
  imageUrl?: string;
}

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpened = false;
  isExpanded = false;
  userInput = '';
  messages: Message[] = [
    {
      text: 'Xin chào! Tôi là <strong>TL Wealth Assistant</strong>. Tôi có thể giúp gì cho bạn về <em>đầu tư</em> và <em>giao dịch</em> hôm nay?',
      isUser: false,
      time: new Date()
    }
  ];
  isTyping = false;
  unreadCount = 0;

  constructor(
    private chatService: ChatService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Initial greeting or load history if needed
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpened = !this.isOpened;
    if (this.isOpened) {
      this.unreadCount = 0;
      setTimeout(() => this.scrollToBottom(), 100);
    } else {
      this.isExpanded = false;
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMsg = this.userInput.trim();
    this.messages.push({
      text: userMsg,
      isUser: true,
      time: new Date()
    });

    this.userInput = '';
    this.isTyping = true;

    const userId = AuthDetail.getLoginedInfo()?.id || 'guest';

    this.chatService.ask(userMsg, userId).subscribe({
      next: (res) => {
        this.isTyping = false;
        
        let replyText = res.reply;
        let imageUrl = '';

        // Extract image URL if present in various formats
        const imageExtensions = /\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i;
        
        // 1. Support custom format: [IMAGE: http://...]
        const customImageRegex = /\[IMAGE:\s*(https?:\/\/[^\]]+)\]/i;
        const customMatch = replyText.match(customImageRegex);
        
        // 2. Support markdown image format: ![alt](url)
        const mdImageRegex = /!\[.*?\]\((https?:\/\/.*?)\)/i;
        const mdMatch = replyText.match(mdImageRegex);
        
        // 3. Support markdown link format that points to an image: [text](url.jpg)
        const mdLinkImageRegex = /\[.*?\]\((https?:\/\/.*?\.(?:jpg|jpeg|png|webp|gif|bmp)(?:\?.*)?)\)/i;
        const mdLinkMatch = replyText.match(mdLinkImageRegex);

        if (customMatch) {
          imageUrl = customMatch[1];
          replyText = replyText.replace(customImageRegex, '').trim();
        } else if (mdMatch) {
          imageUrl = mdMatch[1];
          replyText = replyText.replace(mdImageRegex, '').trim();
        } else if (mdLinkMatch) {
          imageUrl = mdLinkMatch[1];
          replyText = replyText.replace(mdLinkMatch[0], '').trim();
        } else {
          // 4. Support plain URL that points to an image
          const plainUrlRegex = /(https?:\/\/[^\s)]+\.(?:jpg|jpeg|png|webp|gif|bmp)(?:\?.*)?)/i;
          const plainMatch = replyText.match(plainUrlRegex);
          if (plainMatch) {
            imageUrl = plainMatch[1];
            // We don't remove plain URLs as they might be part of the text the user wants to see as a link too
          }
        }

        this.messages.push({
          text: this.formatMarkdown(replyText),
          isUser: false,
          time: new Date(),
          imageUrl: imageUrl
        });
        
        if (!this.isOpened) {
          this.unreadCount++;
        }
      },
      error: (err) => {
        this.isTyping = false;
        this.toastr.error('Có lỗi xảy ra khi kết nối với AI');
        console.error(err);
      }
    });
  }

  likeAnswer(msg: Message) {
    // Find the question for this answer
    const msgIndex = this.messages.indexOf(msg);
    if (msgIndex > 0) {
      const question = this.messages[msgIndex - 1].text;
      this.chatService.like(question, msg.text).subscribe({
        next: () => {
          msg.liked = true;
          this.toastr.success('Cảm ơn bạn đã phản hồi! Câu trả lời đã được lưu để cải thiện hệ thống.');
        },
        error: (err) => {
          this.toastr.error('Không thể lưu phản hồi');
        }
      });
    }
  }

  formatMarkdown(text: string): string {
    if (!text) return '';

    // Extract block and inline math formulas to protect them from markdown formatting
    const mathBlocks: { type: 'block' | 'inline'; formula: string; placeholder: string }[] = [];
    
    // 1. Extract block math $$...$$
    let processedText = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      const placeholder = `__MATH_BLOCK_PLACEHOLDER_${mathBlocks.length}__`;
      mathBlocks.push({
        type: 'block',
        formula: formula.trim(),
        placeholder
      });
      return placeholder;
    });

    // 2. Extract inline math $...$
    // Using a regex that doesn't trigger on regular dollar amounts like $100 (expects no whitespace immediately inside $)
    processedText = processedText.replace(/\$(?!\s)([^\$\n]+?)(?<!\s)\$/g, (match, formula) => {
      const placeholder = `__MATH_INLINE_PLACEHOLDER_${mathBlocks.length}__`;
      mathBlocks.push({
        type: 'inline',
        formula: formula.trim(),
        placeholder
      });
      return placeholder;
    });

    // 3. Format standard markdown elements
    let html = processedText
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists (bullet points)
      .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Numbered Lists
      .replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
      // Line breaks
      .replace(/\n/g, '<br>');

    // 4. Render math using KaTeX and replace placeholders
    const hasKatex = typeof (window as any).katex !== 'undefined';

    mathBlocks.forEach(item => {
      let rendered = '';
      if (hasKatex) {
        try {
          rendered = (window as any).katex.renderToString(item.formula, {
            displayMode: item.type === 'block',
            throwOnError: false
          });
        } catch (e) {
          console.error('KaTeX rendering error:', e);
          rendered = item.type === 'block' ? `$$${item.formula}$$` : `$${item.formula}$`;
        }
      } else {
        // Fallback styling if KaTeX script fails to load
        rendered = item.type === 'block' 
          ? `<div class="math-block-fallback" style="text-align: center; margin: 10px 0; font-family: monospace; overflow-x: auto;">$$${item.formula}$$</div>`
          : `<code class="math-inline-fallback">$${item.formula}$</code>`;
      }
      // Replace the placeholder. Since formula can contain special characters (like $),
      // we use a replacement function instead of passing a string directly to replace()
      // to avoid replacement pattern interpolation (e.g. $&, $', $`).
      html = html.replace(item.placeholder, () => rendered);
    });

    return html;
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }
}
