package com.github.simplemocks.web.app.mocks.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@Entity(name = "web_app_mocks_http_service")
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "web_app_mocks", name = "http_service")
public class HttpServiceEntity {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column(name = "code", nullable = false, unique = true)
    private String code;
    @Column(name = "created_at", nullable = false)
    private Date createdAt;
}
