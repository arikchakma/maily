import { JSONContent } from '@tiptap/core';
import {
	Text,
	Html,
	Head,
	Body,
	Font,
	Container,
	Link,
	Heading,
	Hr,
	Button,
	Img,
} from '@react-email/components';
import { render as reactEmailRender } from '@react-email/render';
import { cn, generateKey } from './utils';
import { CSSProperties } from 'react';

interface NodeOptions {
	parent?: JSONContent;
	prev?: JSONContent;
	next?: JSONContent;
}

interface RenderOptions {
	pretty?: boolean;
	plainText?: boolean;
}

interface MarkType {
	[key: string]: any;
	type: string;
	attrs?: Record<string, any> | undefined;
}

const allowedSpacers = ['sm', 'md', 'lg', 'xl'] as const;
type AllowedSpacers = (typeof allowedSpacers)[number];

const spacers: Record<AllowedSpacers, string> = {
	sm: '8px',
	md: '16px',
	lg: '32px',
	xl: '64px',
};

const antialiased = {
	WebkitFontSmoothing: 'antialiased',
	MozOsxFontSmoothing: 'grayscale',
};

const allowedHeadings = ['h1', 'h2', 'h3'] as const;
type AllowedHeadings = (typeof allowedHeadings)[number];

const headings: Record<
	AllowedHeadings,
	{ fontSize: string; lineHeight: string; fontWeight: number }
> = {
	h1: {
		fontSize: '36px',
		lineHeight: '40px',
		fontWeight: 800,
	},
	h2: {
		fontSize: '30px',
		lineHeight: '36px',
		fontWeight: 700,
	},
	h3: {
		fontSize: '24px',
		lineHeight: '38px',
		fontWeight: 600,
	},
};

const allowedLogoSizes = ['sm', 'md', 'lg'] as const;
type AllowedLogoSizes = (typeof allowedLogoSizes)[number];

const logoSizes: Record<AllowedLogoSizes, string> = {
	sm: '40px',
	md: '48px',
	lg: '64px',
};

class Maily {
	private readonly content: JSONContent;
	private config = {
		theme: {
			extend: {
				colors: {
					heading: 'rgb(17, 24, 39)',
					paragraph: 'rgb(55, 65, 81)',
					horizontal: 'rgb(234, 234, 234)',
				},
				fontSize: {
					paragraph: '15px',
				},
			},
		},
	};

	constructor(content: JSONContent = { type: 'doc', content: [] }) {
		this.content = content;
	}

	render(options?: RenderOptions): string {
		const nodes = this.content?.content || [];
		const jsxNodes = nodes?.map((node, index) => {
			const nodeOptions: NodeOptions = {
				prev: nodes[index - 1],
				next: nodes[index + 1],
				parent: node,
			};

			return this.renderNode(node, nodeOptions);
		});

		const markup = (
			<Html>
				<Head>
					<Font
						fontFamily="Inter"
						fallbackFontFamily="Verdana"
						webFont={{
							url: 'https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19',
							format: 'woff2',
						}}
						fontWeight={400}
						fontStyle="normal"
					/>
				</Head>
				<Body>
					<Container
						style={{
							maxWidth: '600px',
							minWidth: '300px',
							width: '100%',
							marginLeft: 'auto',
							marginRight: 'auto',
							padding: '0.5rem',
						}}
					>
						{jsxNodes}
					</Container>
				</Body>
			</Html>
		);

		return reactEmailRender(markup, options);
	}

	// `getMappedContent` will call corresponding node type
	// and return text content
	private getMappedContent(
		node: JSONContent,
		options?: NodeOptions
	): JSX.Element[] {
		return (
			(node?.content
				?.map((childNode) => {
					return this.renderNode(childNode, options);
				})
				?.filter((node) => node !== null) as JSX.Element[]) || []
		);
	}

	// `renderNode` will call the method of the corresponding node type
	private renderNode(
		node: JSONContent,
		options?: NodeOptions
	): JSX.Element | null {
		const type = node.type!;

		if (type in this) {
			// @ts-ignore
			return this[node.type]?.(node, options);
		} else {
			console.warn(`Node type "${type}" is not supported.`);
			return null;
		}
	}

	// `renderMark` will call the method of the corresponding mark type
	private renderMark(node: JSONContent): JSX.Element {
		// It will wrap the text with the corresponding mark type
		const text = node.text || '&nbsp;';
		const marks = node.marks || [];

		return marks.reduce((acc, mark) => {
			const type = mark.type!;
			if (type in this) {
				// @ts-ignore
				const markElement = this[type]?.(mark, acc);
				return markElement;
			} else {
				console.warn(`Mark type "${type}" is not supported.`);
				return acc;
			}
		}, <>{text}</>);
	}

	paragraph(node: JSONContent, options?: NodeOptions): JSX.Element {
		const { attrs } = node;
		const alignment = attrs?.textAlign || 'left';

		const { parent, next } = options || {};
		const isParentListItem = parent?.type === 'listItem';
		const isNextSpacer = next?.type === 'spacer';

		return (
			<Text
				key={generateKey()}
				style={{
					textAlign: alignment,
					marginBottom: isParentListItem || isNextSpacer ? '0px' : '20px',
					marginTop: '0px',
					fontSize: this.config?.theme?.extend?.fontSize?.paragraph,
					color: this.config?.theme?.extend?.colors?.paragraph,
					...antialiased,
				}}
			>
				{this.getMappedContent(node)}
			</Text>
		);
	}

	text(node: JSONContent) {
		const text = node?.text || '&nbsp';
		if (node?.marks) {
			return this.renderMark(node);
		}

		return text;
	}

	bold(_: MarkType, text: string): JSX.Element {
		return <strong key={generateKey()}>{text}</strong>;
	}

	italic(_: MarkType, text: string): JSX.Element {
		return <em key={generateKey()}>{text}</em>;
	}

	underline(_: MarkType, text: string): JSX.Element {
		return <u key={generateKey()}>{text}</u>;
	}

	strike(_: MarkType, text: string): JSX.Element {
		return (
			<s key={generateKey()} style={{ textDecoration: 'line-through' }}>
				{text}
			</s>
		);
	}

	link(mark: MarkType, text: string): JSX.Element {
		const { attrs } = mark;
		const href = attrs?.href || '#';
		const target = attrs?.target || '_blank';
		const rel = attrs?.rel || 'noopener noreferrer nofollow';

		return (
			<Link
				key={generateKey()}
				href={href}
				target={target}
				rel={rel}
				style={{
					fontWeight: 500,
					textDecoration: 'underline',
					color: this.config?.theme?.extend?.colors?.heading,
				}}
			>
				{text}
			</Link>
		);
	}

	heading(node: JSONContent, options?: NodeOptions): JSX.Element {
		const { attrs } = node;
		const { next, prev } = options || {};

		const level = `h${+attrs?.level || 1}`;
		const alignment = attrs?.textAlign || 'left';
		const isNextSpacer = next?.type === 'spacer';
		const isPrevSpacer = prev?.type === 'spacer';

		const { fontSize, lineHeight, fontWeight } =
			headings[level as AllowedHeadings] || {};

		return (
			<Heading
				key={generateKey()}
				// @ts-ignore
				as={level}
				style={{
					textAlign: alignment,
					color: this.config?.theme?.extend?.colors?.heading,
					marginBottom: isNextSpacer ? '0px' : '12px',
					marginTop: isPrevSpacer ? '0px' : '0px',
					fontSize,
					lineHeight,
					fontWeight,
				}}
			>
				{this.getMappedContent(node)}
			</Heading>
		);
	}

	variable(node: JSONContent): JSX.Element {
		const { attrs } = node;
		const variable = attrs?.id || '';

		return <>{`{{${variable}}}`}</>;
	}

	horizontalRule(node: JSONContent, options?: NodeOptions): JSX.Element {
		return (
			<Hr
				style={{
					marginTop: '32px',
					marginBottom: '32px',
				}}
			/>
		);
	}

	orderedList(node: JSONContent, options?: NodeOptions): JSX.Element {
		return (
			<Container key={generateKey()}>
				<ol
					style={{
						marginTop: '0px',
						marginBottom: '20px',
						paddingLeft: '26px',
						listStyleType: 'decimal',
					}}
				>
					{this.getMappedContent(node)}
				</ol>
			</Container>
		);
	}

	bulletList(node: JSONContent, options?: NodeOptions): JSX.Element {
		return (
			<Container key={generateKey()}>
				<ul
					className="list-disc mt-0 pl-[26px] mb-5"
					style={{
						marginTop: '0px',
						marginBottom: '20px',
						paddingLeft: '26px',
						listStyleType: 'disc',
					}}
				>
					{this.getMappedContent(node)}
				</ul>
			</Container>
		);
	}

	listItem(node: JSONContent, options?: NodeOptions): JSX.Element {
		return (
			<li key={generateKey()} className={cn('mb-2 pl-1.5 antialiased')}>
				{this.getMappedContent(node, { ...options, parent: node })}
			</li>
		);
	}

	button(node: JSONContent, options?: NodeOptions): JSX.Element {
		const { attrs } = node;
		const {
			text,
			url,
			variant,
			buttonColor,
			textColor,
			borderRadius,
			// @TODO: Update the attribute to `textAlign`
			alignment = 'left',
		} = attrs || {};

		let radius: string | undefined = '0px';
		if (borderRadius === 'round') {
			radius = '9999px';
		} else if (borderRadius === 'smooth') {
			radius = '6px';
		}

		return (
			<Container
				key={generateKey()}
				style={{
					textAlign: alignment,
				}}
			>
				<Button
					href={url}
					style={{
						color: String(textColor),
						backgroundColor:
							variant === 'filled' ? String(buttonColor) : 'transparent',
						borderColor: String(buttonColor),
						padding: variant === 'filled' ? '12px 34px' : '10px 34px',
						borderWidth: '2px',
						borderStyle: 'solid',
						textDecoration: 'none',
						fontSize: '14px',
						fontWeight: 500,
						borderRadius: radius,
					}}
				>
					{text}
				</Button>
			</Container>
		);
	}

	spacer(node: JSONContent, options?: NodeOptions): JSX.Element {
		const { attrs } = node;
		const { height = 'auto' } = attrs || {};

		return (
			<Container
				key={generateKey()}
				style={{
					height: spacers?.[height as AllowedSpacers] || height,
				}}
			/>
		);
	}

	hardBreak(node: JSONContent, options?: NodeOptions): JSX.Element {
		return <br key={generateKey()} />;
	}

	logo(node: JSONContent, options?: NodeOptions): JSX.Element {
		const { attrs } = node;
		const {
			src,
			alt,
			title,
			size,
			// @TODO: Update the attribute to `textAlign`
			alignment,
		} = attrs || {};

		let margin: CSSProperties = {
			marginRight: 'auto',
		};
		if (alignment === 'center') {
			margin = {
				marginRight: 'auto',
				marginLeft: 'auto',
			};
		} else if (alignment === 'right') {
			margin = {
				marginLeft: 'auto',
			};
		}

		return (
			<Img
				key={generateKey()}
				alt={alt || title || 'Logo'}
				title={title || alt || 'Logo'}
				src={src}
				style={{
					width: logoSizes?.[size as AllowedLogoSizes] || size,
					height: logoSizes?.[size as AllowedLogoSizes] || size,
					...margin,
				}}
			/>
		);
	}

	image(node: JSONContent, options?: NodeOptions): JSX.Element {
		const { attrs } = node;
		const { src, alt, title } = attrs || {};

		const { next } = options || {};
		const isNextSpacer = next?.type === 'spacer';

		return (
			<Img
				key={generateKey()}
				alt={alt || title || 'Image'}
				title={title || alt || 'Image'}
				src={src}
				style={{
					height: 'auto',
					width: 'auto',
					maxWidth: '100%',
					marginBottom: isNextSpacer ? '0px' : '32px',
					marginTop: '0px',
				}}
			/>
		);
	}
}

const maily = new Maily({
	type: 'doc',
	content: [
		{
			type: 'logo',
			attrs: {
				src: '/brand/icon.svg',
				alt: null,
				title: null,
				'mailbox-component': 'logo',
				size: 'md',
				alignment: 'left',
			},
		},
		{
			type: 'spacer',
			attrs: {
				height: 'xl',
			},
		},
		{
			type: 'heading',
			attrs: {
				textAlign: 'left',
				level: 2,
			},
			content: [
				{
					type: 'text',
					marks: [
						{
							type: 'bold',
						},
					],
					text: 'Discover Maily',
				},
			],
		},
		{
			type: 'paragraph',
			attrs: {
				textAlign: 'left',
			},
			content: [
				{
					type: 'text',
					text: 'Are you ready to transform your email communication? Introducing Maily, the powerful email editor that enables you to craft captivating emails effortlessly.',
				},
			],
		},
		{
			type: 'paragraph',
			attrs: {
				textAlign: 'left',
			},
			content: [
				{
					type: 'text',
					text: 'Elevate your email communication with Maily! Click below to try it out:',
				},
			],
		},
		{
			type: 'button',
			attrs: {
				mailboxComponent: 'button',
				text: 'Try Maily Now →',
				url: '',
				alignment: 'left',
				variant: 'filled',
				borderRadius: 'round',
				buttonColor: '#141313',
				textColor: '#ffffff',
			},
		},
		{
			type: 'spacer',
			attrs: {
				height: 'xl',
			},
		},
		{
			type: 'paragraph',
			attrs: {
				textAlign: 'left',
			},
			content: [
				{
					type: 'text',
					text: 'Join our vibrant community of users and developers on GitHub, where Maily is an ',
				},
				{
					type: 'text',
					marks: [
						{
							type: 'link',
							attrs: {
								href: 'https://github.com/arikchakma/maily.to',
								target: '_blank',
								rel: 'noopener noreferrer nofollow',
								class: null,
							},
						},
						{
							type: 'italic',
						},
					],
					text: 'open-source',
				},
				{
					type: 'text',
					text: " project. Together, we'll shape the future of email editing.",
				},
			],
		},
		{
			type: 'paragraph',
			attrs: {
				textAlign: 'left',
			},
			content: [
				{
					type: 'text',
					text: 'Regards,',
				},
				{
					type: 'hardBreak',
				},
				{
					type: 'text',
					text: 'Arikko',
				},
			],
		},
	],
});

const startAt = performance.now();
const html = maily.render();
console.log(html);
const endAt = performance.now();
console.log(`Rendered in ${endAt - startAt}ms`);
