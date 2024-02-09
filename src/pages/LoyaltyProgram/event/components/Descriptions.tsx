import { Divider } from '@nextui-org/react';
import { useState } from 'react';

export default function Descriptions() {
  const [content, setContent] = useState(`
    <div class="text-[#999] text-base leading-[1.875rem] [&>:not(:first-child)]:mt-[1.0625rem]">
      <p>Our test server will open at 4:00 pm, Nov. 16th, Singapore time :</p>
      <p class="text-white">Step 1  Complete the NDA with your Discord Username and email address</p>
      <p>Please thoroughly read the NDA content and complete the signing process via the questionnaire. Ensure that all questions are filled correctly.</p>
      <p class="text-basic-yellow">- Remember to click "submit"</p>
      <p class="text-white">Step 2  Install AstrArk</p>
      <p>Once you signed the NDA, you'll receive a download link. Please do not share this link externally. Please ensure installation before 4:00 pm, Nov. 16th, Singapore time.</p>
      <p class="text-white">Step 3  Start your trial and share your feedback through the in-game survey</p>
      <p>There will be 2 in-game surveys. Experience the game freely and share your feedbacks with us.</p>
      <p>Your feedback is immensely valuable. Thank you for supporting this test. if you have any questions, feel free to contact us.</p>
      <p class="text-basic-yellow">BONUS: Every pre-alpha tester **@Tester** will get 50 Moonveil Community Points</p>
    </div>
  `);

  return (
    <div className="mt-20">
      <div className="font-semakin text-2xl leading-none">Descriptions</div>

      <Divider className="my-6" />

      <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </div>
  );
}
