import { Apply, EventDeclaration } from '../../../models/Event';
import { useApplies } from '../../../db/firestore';
import { Typography } from '@mui/material';
import React from 'react';
import { humanFriendlyTimeDifference } from '../../../utils/utils';
import CircularProgress from '@mui/material/CircularProgress';
import confetti from 'canvas-confetti';
export interface EventFieldPageProps {
	event: EventDeclaration;
	apply: Apply;
	eventId: string;
	applyId: string;
	timeError: number;
}

const EventFieldPage = ({
	event,
	apply,
	eventId,
	applyId,
	timeError,
}: EventFieldPageProps) => {
	const applies = useApplies(eventId);

	const limitation = event.limitation;
	const submitterList = Object.entries(applies ?? {})
		.filter((apply) => !!apply[1].submitRequestedAt)
		.sort((a, b) => {
			const aRequestedAt = a[1].submitRequestedAt?.toDate().getTime();
			const bRequestedAt = b[1].submitRequestedAt?.toDate()?.getTime();

			if (!aRequestedAt) return 1;
			if (!bRequestedAt) return -1;

			const timeDiff = aRequestedAt - bRequestedAt;
			if (timeDiff > 0) return 1;
			if (timeDiff < 0) return -1;

			return 0;
		})
		.slice(0, limitation);

	const myIndex = submitterList.findIndex((apply) => apply[0] === applyId);

	const [diff, setDiff] = React.useState('');
	React.useEffect(() => {
		const interval = setInterval(() => {
			try {
				const lastDate =
					submitterList[
						submitterList.length - 1
					][1].submitRequestedAt?.toDate();

				if (!lastDate) return;
				const now = new Date();
				setDiff(humanFriendlyTimeDifference(lastDate, now));
			} catch (e) {
				return;
			}
		}, 30);

		return () => {
			clearInterval(interval);
		};
	}, [submitterList]);

	const submitted = myIndex !== -1;

	React.useEffect(() => {
		if (!submitted) return;

		const triggerConfetti = () => {
			confetti({
				particleCount: 20,
				startVelocity: 20,
				spread: 100,
				origin: {
					x: 0.5,
					y: -0.1,
				},
				scalar: 0.8,
			});
		};

		const intervalId = setInterval(() => {
			triggerConfetti();
		}, 1000);

		return () => {
			if (intervalId) clearTimeout(intervalId);
		};
	}, [submitted]);

	if (!applies)
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '75vh',
				}}
			>
				<CircularProgress color="inherit" />
			</div>
		);

	if (myIndex === -1)
		return (
			<div>
				당첨에 실패하였습니다..
				<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
					행운이 찾아 온지 벌써 <br /> {diff}
				</Typography>
			</div>
		);

	return (
		<div>
			<h1>{myIndex + 1}번째로 당첨되었습니다!</h1>
		</div>
	);
};

export default EventFieldPage;
