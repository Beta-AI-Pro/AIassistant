"use client";
import { useState } from "react";
import { Navigation } from "../components/nav";
import Particles from "../components/particles";
import { ArrowRight, Clipboard } from "lucide-react";
import "./styles.css"; // Import the CSS file

// Define the type of the response data
interface ResponseData {
	response: string;
}

export default function Chatbot() {
	const [search, setSearch] = useState("");
	// Define the state with the correct type
	const [results, setResults] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	const handleSearch = async () => {
		if (!search.trim()) return;
		
		setLoading(true);
		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: search })
			});
			
			const data: ResponseData = await response.json();
			setResults(prev => [data.response, ...prev]);
		} catch (error) {
			setResults(prev => ['❌ Failed to get response', ...prev]); // Add emoji to error message
		}
		setLoading(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const renderResponse = (response: string) => {
		const parts = response.split(/(\*\*.*?\*\*|\*.*?\*|```.*?```|\n- .*)/g);
		return parts.map((part, index) => {
			if (part.startsWith('**') && part.endsWith('**')) {
				return <strong key={index}>{part.slice(2, -2)}</strong>;
			} else if (part.startsWith('*') && part.endsWith('*')) {
				return <em key={index}>⭐ {part.slice(1, -1)} ⭐</em>; // Replace asterisks with star emoji
			} else if (part.startsWith('```') && part.endsWith('```')) {
				const code = part.slice(3, -3);
				return (
					<div key={index} className="relative">
						<pre className="bg-zinc-800 p-2 rounded-lg code-block">
							<code>{code}</code>
						</pre>
						<button
							className="absolute top-2 right-2 p-1 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600"
							onClick={() => navigator.clipboard.writeText(code)}
						>
							<Clipboard size={16} />
						</button>
					</div>
				);
			} else if (part.startsWith('\n- ')) {
				return <li key={index}>{part.slice(3)}</li>;
			} else if (part.startsWith('[') && part.endsWith(')')) {
				const [text, url] = part.slice(1, -1).split('](');
				return (
					<a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
						{text}
					</a>
				);
			} else if (part.includes('\n')) {
				return part.split('\n').map((line, lineIndex) => (
					<p key={`${index}-${lineIndex}`} className="mb-2">
						{line.replace(/\*/g, '')} {/* Remove any remaining asterisks */}
					</p>
				));
			} else {
				return <span key={index}>{part.replace(/\*/g, '')}</span>; {/* Remove any remaining asterisks */}
			}
		});
	};

	return (
		<div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
			<Navigation />
			<div className="hidden w-screen h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
			<Particles
				className="absolute inset-0 -z-10 animate-fade-in"
				quantity={100}
			/>
			<div className="flex-grow" />
			<h1 className="py-3.5 px-0.5 z-10 text-4xl text-transparent duration-1000 bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text">
				b
			</h1>
			<div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
			<div className="container flex flex-col items-center justify-center flex-grow px-4 mx-auto mt-20">
				<div className="relative w-full max-w-2xl mb-4">
					<input
						type="text"
						className="w-full p-2 rounded-lg bg-zinc-700 text-white pr-10"
						placeholder="🔍 Ask anything..." // Add emoji to placeholder text
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyDown={handleKeyDown}
						disabled={loading}
					/>
					<button
						className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 disabled:opacity-50"
						onClick={handleSearch}
						disabled={loading}
					>
						<ArrowRight size={20} />
					</button>
				</div>
				{results.length === 0 && (
					<p className="text-white text-opacity-50 mt-2">⚠️ b can make mistakes as we are still testing in lab</p> // Add emoji to loading message
				)}
				<div className="w-full max-w-2xl h-96 overflow-y-auto rounded-lg">
					{loading && (
						<div className="flex justify-center items-center h-full">
							<div className="loader"></div>
						</div>
					)}
					{results.map((result, index) => (
						<div
							key={index}
							className="response-bar p-2 bg-zinc-800 text-white rounded-lg animate-fade-in"
						>
							{renderResponse(result)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}