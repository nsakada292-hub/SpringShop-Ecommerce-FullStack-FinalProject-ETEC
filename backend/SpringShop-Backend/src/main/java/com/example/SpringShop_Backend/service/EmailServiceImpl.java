package com.example.SpringShop_Backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    @Value("${app.otp.log-to-console:true}")
    private boolean logOtpToConsole;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        if (logOtpToConsole) {
            log.info("OTP for {} is: {}", toEmail, otpCode);
        }

        try {
            sendHtmlOtpEmail(toEmail, otpCode);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {} - the code is still available in the server console", toEmail, e);
        }
    }

    private void sendHtmlOtpEmail(String toEmail, String otpCode) throws Exception {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("SpringShop - Your Email Verification Code");
        helper.setText(buildOtpEmailHtml(toEmail, otpCode), true);
        mailSender.send(mimeMessage);
    }

    private String buildOtpEmailHtml(String toEmail, String otpCode) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <body style="margin:0;padding:0;background-color:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f7f9;padding:32px 16px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;">
                          <tr>
                            <td align="center" style="padding:36px 32px 8px;">
                              <span style="font-size:28px;font-weight:bold;color:#111827;">Spring<span style="color:#22c55e;">Shop</span></span>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:8px 32px;">
                              <p style="margin:8px 0 0;font-size:17px;color:#111827;font-weight:bold;">Email Verification Code</p>
                              <p style="margin:6px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">Hi <b>{email}</b>,<br/>Use the 6-digit code below to verify your email address.</p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:28px 32px;">
                              <div style="display:inline-block;background:#ecfdf5;border:2px dashed #22c55e;border-radius:12px;padding:20px 38px;font-size:38px;font-weight:bold;letter-spacing:10px;color:#16a34a;">{otp}</div>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:0 32px;">
                              <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.8;">This code is valid for <b>{minutes} minutes</b>.<br/>Do not share this code with anyone.</p>
                              <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">If you did not request this, you can safely ignore this email.</p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:24px 32px 28px;border-top:1px solid #f3f4f6;">
                              <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; SpringShop &bull; Near 16 St 139, Phnom Penh</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """
                .replace("{email}", toEmail)
                .replace("{otp}", otpCode)
                .replace("{minutes}", String.valueOf(otpExpiryMinutes));
    }
}