package com.github.sibdevtools.web.app.mocks.controller;

import com.github.sibdevtools.common.api.rs.StandardRs;
import com.github.sibdevtools.web.app.mocks.api.rq.CreateMockRq;
import com.github.sibdevtools.web.app.mocks.api.rq.SetEnabledMockRq;
import com.github.sibdevtools.web.app.mocks.api.rq.UpdateMockRq;
import com.github.sibdevtools.web.app.mocks.api.rs.CreateMockRs;
import com.github.sibdevtools.web.app.mocks.api.rs.GetMockRs;
import com.github.sibdevtools.web.app.mocks.api.rs.GetMockUrlRs;
import com.github.sibdevtools.web.app.mocks.api.rs.UpdateMockRs;
import com.github.sibdevtools.web.app.mocks.service.WebAppMocksService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

@Slf4j
@RestController
@RequestMapping(
        path = "${web.app.mocks.uri.rest.mocks.path}",
        produces = MediaType.APPLICATION_JSON_VALUE
)
public class WebAppMocksRestController {
    private static final Base64.Decoder B64_DECODER = Base64.getDecoder();

    private final WebAppMocksService webAppMocksService;

    @Autowired
    public WebAppMocksRestController(WebAppMocksService webAppMocksService) {
        this.webAppMocksService = webAppMocksService;
    }

    @PostMapping(
            path = "/",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public CreateMockRs create(@PathVariable("serviceId") long serviceId,
                               @RequestBody @Validated CreateMockRq rq) {
        var content = rq.getContent();
        var httpMockEntity = webAppMocksService.create(
                serviceId,
                rq.getMethod(),
                rq.getName(),
                rq.getPath(),
                rq.getType(),
                rq.getDelay(),
                rq.getMeta(),
                B64_DECODER.decode(content)
        );
        return new CreateMockRs(httpMockEntity.getId());
    }

    @PutMapping(
            path = "/{mockId}",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public UpdateMockRs update(@PathVariable("mockId") long mockId,
                               @RequestBody @Validated UpdateMockRq rq) {
        var content = rq.getContent();
        var httpMockEntity = webAppMocksService.update(
                mockId,
                rq.getMethod(),
                rq.getName(),
                rq.getPath(),
                rq.getType(),
                rq.getDelay(),
                rq.getMeta(),
                B64_DECODER.decode(content)
        );
        return new UpdateMockRs(httpMockEntity.getId());
    }

    @PutMapping(
            path = "/{mockId}/enabled",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public UpdateMockRs setEnabled(@PathVariable("mockId") long mockId, @RequestBody SetEnabledMockRq rq) {
        var httpMockEntity = webAppMocksService.setEnabled(
                mockId,
                rq.isEnabled()
        );
        return new UpdateMockRs(httpMockEntity.getId());
    }

    @DeleteMapping("/{mockId}")
    public StandardRs delete(@PathVariable("mockId") long mockId) {
        webAppMocksService.deleteMockById(mockId);
        return new StandardRs();
    }

    @GetMapping("/{mockId}")
    public GetMockRs get(@PathVariable("mockId") long mockId) {
        var mockDto = webAppMocksService.get(mockId);
        return new GetMockRs(mockDto);
    }

    @GetMapping("/{mockId}/url")
    public GetMockUrlRs getUrl(@PathVariable("mockId") long mockId,
                               HttpServletRequest rq) {
        var mockUrl = webAppMocksService.getUrl(mockId, rq);
        return new GetMockUrlRs(mockUrl);
    }

}
